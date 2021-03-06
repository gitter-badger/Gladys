const queries = require('./brain.queries.js');
const Promise = require('bluebird');
const injector = require('./injector/injector.js');

module.exports = function answer(result, user) {

    return gladys.utils.sql(queries.getAnswers, [user.language, result.response.label])
        .then((answers) => {

            // pick one answer randomly
            var randomRow = Math.floor(Math.random() * answers.length) + 0;

            // test if answer exist, if yes pick the text
            if(randomRow != -1 && answers[randomRow] != undefined) {
                result.response.text = answers[randomRow].text;
                result.response.needAnswer = answers[randomRow].needAnswer;
            }
            else {
                result.response.text = null;
                result.response.needAnswer = false;
            }

            // replace variables by values
            result.response.text = injector.inject(result.response.text, result.response.scope);

            var newMessage = {
                sender: null,
                receiver: user.id,
                text: result.response.text
            };

            return [gladys.message.create(newMessage), gladys.utils.sql(queries.getNotificationTypes, [user.id])];
        })
        .spread((newMessage, notificationTypes) => {

            // adding senderName
            newMessage.senderName = user.assistantName;
            newMessage.needAnswer = result.response.needAnswer;

            // test each notification system
            return Promise.mapSeries(notificationTypes, function(notificationType) {
                return trySendingMessage(newMessage, notificationType, user)
                    .catch((err) => {

                        // if error is normal, propagate error to abort chain
                        if(err.message == 'ok') return Promise.reject(err);
                    });
            })
            .catch(function(err) {
                if (err.message !== 'ok') {
                    sails.log.warn(err);
                }
            });
        })
        .then(() => result);
};

/**
 * Call the service related to the notification
 */
function trySendingMessage(newMessage, type, user) {

    var toCall;

    if (gladys.modules[type.service] && typeof gladys.modules[type.service].notify == "function") {
        toCall = gladys.modules[type.service].notify;
    } else if(gladys[type.service] && typeof gladys[type.service].notify == "function") {
        toCall = gladys[type.service].notify;
    } else {
        return Promise.reject(new Error(`${type.service} is not a valid service`));
    }
    
    sails.log.info(`Brain : answer : Trying to contact ${type.service}`);

    return toCall(newMessage, user)
        .then(function(result) {
            
            sails.log.info(`Message sent with success with ${type.service}. Aborting the chain.`);
            
            // if module resolved, we stop the promise chain
            // it means one notification worked! 
            return Promise.reject(new Error('ok'));
        })
        .catch(function(e){
           
           // if the error is because we want to exist the promise chain,
           // we need to propagate the error
           if(e.message === 'ok') return Promise.reject(e);
           
           // if notification does not work, we resolve
           // it means that we need to continue the flow
           return Promise.resolve(); 
        });
}