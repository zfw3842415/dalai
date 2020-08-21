//index.js
//获取应用实例
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { checkVip, checkMemeber, relationShip, favorite } from '../../utils/Biz'
const wxRequst = promisify(wx.request)
const wxLogin = promisify(wx.login)
const wxStorge = promisify(wx.setStorage)
const getStorge = promisify(wx.getStorage);
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    type: 0,
    id: 0,
    msgCount: 0,
    vipCheck: false,
    favourtieNum: 0,
    pointNum: 0,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: 0
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow: function () {
    $init(this);
    if (checkVip()) {
      this.data.vipCheck = true;
    }
    getStorge({ key: 'openId' }).then(
      res => {
        console.log(res.data.openId)
        this.data.openId = res.data.openId;
        if (typeof (this.data.openId) =='undefined'){
              return false;
        }
        wxRequst(
          {
            data: null,
            url: `${apiUrl}/members/${res.data
              .openId}`
          }
        ).then(
          res => {
            console.log(res);
            this.data.type = res.data.type;
            this.data.id = res.data.id;
            wxRequst(
              {
                data: { id: this.data.openId },
                url: `${apiUrl}/favorites/getinfo`
              }
            ).then(res => {
              console.log(res)
              this.data.favourtieNum = res.data.total
              wxRequst({

                data: { id: this.data.openId },
                url: `${apiUrl}/message/getmsg`
              }
              ).then(res => {
                let count = 0;
                count = res.data.count;
                getStorge({ key: 'myMsgCount' }).then(res => {
                  if (count > res.data.count) {
                    this.data.msgCount = count;
                  } else {
                    this.data.msgCount = 0;
                  }
                }).catch();
                wxStorge({ 'key': 'myMsgCount', data: this.data.msgCount });
                $digest(this);
              }
              ).catch();

            }).catch(res => { })
          }
        ).catch(res => {
        });
        getStorge({ key: 'weixinInfo' }).then(res => {
          console.log(res);
          app.globalData.userInfo = res.data;
          if (typeof (app.globalData.userInfo) != null) {
            this.data.userInfo = app.globalData.userInfo;
            this.data.hasUserInfo = true;
            $digest(this);
          } else if (this.data.canIUse && app.globalData.userInfo) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
              getStorge({ key: 'weixinInfo' }).then(res => {
                this.data.userInfo = res.userInfo;
                this.data.hasUserInfo = true;
                $digest(this);
              }).catch(res => { });
            }
          } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
              success: res => {
                app.globalData.userInfo = res.userInfo
                getStorge({ key: 'weixinInfo' }).then(res => {
                  this.data.userInfo = res.userInfo;
                  this.data.hasUserInfo = true;
                  $digest(this);
                }).catch(res => { });
              }
            })
          }
        }).catch(res => { });
      }).catch(res => { })

    getStorge({ key: 'openId' }).then(
      res => {
        this.data.openId = res.data.openId;
        if(typeof res.data.openId !='undefined'){
          wxRequst(
            {
              data: null,
              url: `${apiUrl}/members/${res.data
                .openId}`
            }
          ).then(
            res => {
              console.log(res);
              this.data.type = res.data.type;
              this.data.id = res.data.id;
              wxRequst(
                {
                  data: { id: this.data.openId },
                  url: `${apiUrl}/favorites/getinfo`
                }
              ).then(res => {
                console.log(res)
                this.data.favourtieNum = res.data.total
                wxRequst({
                  data: { id: this.data.openId },
                  url: `${apiUrl}/message/getmsg`
                }
                ).then(res => {
                  let count = 0;
                  count = res.data.count;
                  getStorge({ key: 'myMsgCount' }).then(res => {
                    if (count > res.data.count) {
                      this.data.msgCount = count;
                    } else {
                      this.data.msgCount = 0;
                    }
                  }).catch();
                  wxStorge({ 'key': 'myMsgCount', data: this.data.msgCount });
                  $digest(this);
                }
                ).catch();
  
              }).catch(res => { })
            }
          ).catch(res => {
          });
        }
      }).catch(res => { })
  },
  getUserInfo: function (e) {
    var dataEncrptInfo = e.detail.encryptedData;
    var iv = e.detail.iv;
    wxLogin().then(res => {
      wxRequst({
        data: {
          "encryptedData": dataEncrptInfo,
          "iv": iv,
          "code": res.code,
          "type": 0
        }, method: 'post',
        url: `${apiUrl}/weixin/decode`
      }).then(res => {
        let weixinInfo = res.data;
        wxStorge({ 'key': 'weixinInfo', data: weixinInfo });
        if (weixinInfo.status == 0) {
          wx.navigateTo({
            url: '../info/info?type=0',
          })
        } else {
          wxStorge({ 'key': 'weixinInfo', data: weixinInfo });
          wxStorge({ 'key': 'openId', data: { openId: weixinInfo.id } });
          app.globalData.userInfo = res.data;
          this.onShow();
        }

      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    }).catch(res => { console.log(res) });
  }
})
