import * as React from 'react';
import Notification from 'rc-notification';
import './Message.less'
var defaultDuration = 3;
var defaultTop;
var messageInstance;
var key = 1;
var prefixCls = 'ant-message';
var transitionName = 'move-up';
var getContainer;
var maxCount;

function getMessageInstance(callback) {
  if (messageInstance) { callback(messageInstance); return;}

  Notification.newInstance({prefixCls, transitionName, style: {
      top: defaultTop || '10px'
    }, getContainer, maxCount
  }, instance => {
      if (messageInstance) {callback(messageInstance);return;}
      messageInstance = instance;
      callback(instance);
    }
  );
}

function notice(args) {
  var duration = args.duration !== undefined ? args.duration : defaultDuration;
  var target = key++;
  var closePromise = new Promise(resolve => {
    var callback = function callback() {
      typeof args.onClose === 'function' && args.onClose();
      return resolve(true);
    };

    getMessageInstance(instance => {
      instance.notice({
        key: target,
        duration,
        style: {},
        content: React.createElement("div", {
          className: "".concat(prefixCls, "-custom-content").concat(args.type ? " ".concat(prefixCls, "-").concat(args.type) : '')
        }, '', React.createElement("span", null, args.content)),
        onClose: callback
      });
    });
  });

  var result = function result() {
    messageInstance && messageInstance.removeNotice(target);
  };

  result.then = (filled, rejected) => closePromise.then(filled, rejected);

  result.promise = closePromise;
  return result;
}

var api = {
  open: notice,
  config: function config(options) {
    if (options.top !== undefined) {
      defaultTop = options.top;
      messageInstance = null; // delete messageInstance for new defaultTop
    }

    if (options.duration !== undefined) {
      defaultDuration = options.duration;
    }

    if (options.prefixCls !== undefined) {
      prefixCls = options.prefixCls;
    }

    if (options.getContainer !== undefined) {
      getContainer = options.getContainer;
    }

    if (options.transitionName !== undefined) {
      transitionName = options.transitionName;
      messageInstance = null; // delete messageInstance for new transitionName
    }

    if (options.maxCount !== undefined) {
      maxCount = options.maxCount;
      messageInstance = null;
    }
  },
  destroy: function destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }
  }
};
['success', 'info', 'warning', 'error', 'loading'].forEach(function (type) {
  api[type] = function (content, duration, onClose) {
    if (typeof duration === 'function' || isNaN(Number(duration))) {
      onClose = duration;
      duration = undefined;
    }
    setTimeout(api.destroy, (duration || defaultDuration) * 1000);
    return api.open({ content, duration, type, onClose });
  };
});
api.warn = api.warning;
export default api;