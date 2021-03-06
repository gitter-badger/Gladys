/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Pierre-Gilles Leymarie
  */


/**
 * @apiDefine DeviceSuccess
 * @apiSuccess {String} name Name of the device.
 * @apiSuccess {String} protocol The protocol the device is using (zwave, wifi)
 * @apiSuccess {String} service The service handling the device (a module name)
 * @apiSuccess {String} identifier An unique identifier to identify the device
 * @apiSuccess {Integer} room The room where the device is
 */

/**
 * @apiDefine DeviceParam
 * @apiParam {String} name Name of the device.
 * @apiParam {String} protocol The protocol the device is using (zwave, wifi)
 * @apiParam {String} service The service handling the device (a module name)
 * @apiParam {String} [identifier] An unique identifier to identify the device
 * @apiParam {Integer} [room] The room where the device is
 */

module.exports = {
  
  
  /**
   * @api {get} /device get all devices
   * @apiName getDevice
   * @apiGroup Device
   * @apiPermission authenticated
   *
   * @apiParam {Integer} take the number of device to return
   * @apiParam {Integer} skip the number of device to skip
   * 
   * @apiUse DeviceSuccess
   */
  index: function(req, res, next) {
      gladys.device.get(req.query)
            .then(function(devices){
                return res.json(devices);
            })
            .catch(next);
  },
  
  /**
   * @api {get} /device/:id/devicetype get by device
   * @apiName getByDevice
   * @apiGroup DeviceType
   * @apiPermission authenticated
   * 
   * @apiUse DeviceTypeSuccess
   */
  getDeviceTypes: function(req, res, next){
    gladys.deviceType.getByDevice({id: req.params.id})
      .then(function(deviceTypes){
          return res.json(deviceTypes);
      }) 
      .catch(next);
  },
  
   /**
   * @api {post} /device create a device
   * @apiName createDevice
   * @apiGroup Device
   * @apiPermission authenticated
   *
   * @apiUse DeviceParam
   * 
   * @apiUse DeviceSuccess
   */
  create: function(req, res, next) {
      gladys.device.create(req.body)
            .then(function(device){
                return res.status(201).json(device);
            })
            .catch(next);
  },
  
  /**
   * @api {patch} /device/:id update a device
   * @apiName updateDevice
   * @apiGroup Device
   * @apiPermission authenticated
   *
   * @apiUse DeviceParam
   * 
   * @apiUse DeviceSuccess
   */
  update: function(req, res, next) {
      req.body.id = req.params.id;
      gladys.device.update(req.body)
            .then(function(device){
                return res.json(device);
            })
            .catch(next);
  },
  
  /**
   * @api {delete} /device/:id delete a device
   * @apiName deleteDevice
   * @apiGroup Device
   * @apiPermission authenticated
   */
  delete: function(req, res, next) {
      gladys.device.delete({id: req.params.id})
            .then(function(device){
                return res.json(device);
            })
            .catch(next);
  }
    
};