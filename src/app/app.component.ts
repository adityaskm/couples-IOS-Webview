import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'webview';
  uniqueId = 0;

  bridge;

  ngOnInit() {
    this.setupWKWebViewJavascriptBridge(
      this.callBackForWkWebViewJSBridge.bind(this)
    );
  }

  setupWKWebViewJavascriptBridge(callback: Function) {
    if (window['WKWebViewJavascriptBridge']) {
      return callback(window['WKWebViewJavascriptBridge']);
    }
    if (window['WKWVJBCallbacks']) {
      return window['WKWVJBCallbacks'].push(callback);
    }
    window['WKWVJBCallbacks'] = [callback];
    window['webkit'].messageHandlers.iOS_Native_InjectJavascript.postMessage(
      null
    );
  }

  callBackForWkWebViewJSBridge(bridge) {
    this.bridge = bridge;
    this.registerBridgeHandler();
  }

  registerBridgeHandler() {
    this.checkJSBridgeStatus();
    this.bridge.registerHandler('testJavascriptHandler', function (
      data,
      responseCallback
    ) {
      this.log('iOS called testJavascriptHandler with', data, 'native');
      var responseData = { 'Javascript Says': 'Right back atcha!' };
      this.log('JS responding with', responseData, 'native');
      responseCallback(responseData);
    });
  }

  log(message, data, type) {
    const log = document.getElementById('log');
    const el = document.createElement('div');
    el.className = type == 'native' ? 'logLine_Native' : 'logLine_JS';
    el.innerHTML =
      this.uniqueId++ + '. ' + message + ':<br/>' + JSON.stringify(data);
    if (log.children.length) {
      log.insertBefore(el, log.children[0]);
    } else {
      log.appendChild(el);
    }
  }

  fireIOSCallback() {
    this.log('JS calling handler "testiOSCallback"', null, null);
    this.checkJSBridgeStatus();
    this.bridge?.callHandler('testiOSCallback', { foo: 'bar' }, function (
      response
    ) {
      this.log('JS got response', response, 'js');
    });
  }

  checkJSBridgeStatus() {
    if (!this.bridge) {
      alert('Bridge Not defined');
    }
  }
}
