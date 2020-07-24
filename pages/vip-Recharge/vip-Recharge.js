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
const wxPayment = promisify(wx.requestPayment);
const app = getApp()
Page({
  data: {
    money: [
    ],
    userInfo: {},
    vipId: 0,
    hasUserInfo: false,
    vipExpireDate: '请先充值会员',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //选择用途后加样式
  select_use: function (e) {
    console.log(e.currentTarget.dataset.key);
    for(let key in this.data.money){
      this.data.money[key].state =0;
    }
    this.data.money[e.currentTarget.dataset.key].state = 1
    this.data.vipId = e.currentTarget.dataset.index;
    $digest(this);
  },
  onReady: function () { },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    $init(this);
    checkMemeber();
    getStorge({ key: 'weixinInfo' }).then(res => {
      app.globalData.userInfo = res.data;
      console.log(app.globalData.userInfo)
      if (typeof (app.globalData.userInfo) != null) {
        this.data.userInfo = app.globalData.userInfo;
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
    getStorge({ key: 'openId' }).then(res => {
      wxRequst({ data: { id: res.data.openId }, url: `${apiUrl}/vip` }).then(res => {
        this.data.money = res.data;
        $digest(this);
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    }).catch(res => { });

    getStorge({ key: 'openId' }).then(res => {
      wxRequst({ data: { id: res.data.openId }, url: `${apiUrl}/viplist` }).then(res => {
        if (res.data != null) {
          this.data.vipExpireDate = res.data.vipExpireDate;
        } else {
          return false;
        }
        $digest(this);
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      });
    }).catch(res => { });

  },
  purchapurchaseVip: function (e) {
    getStorge({ key: 'openId' }).then(res => {
      if (this.data.vipId == 0) {
        wx.showToast({
          title: '请选择充值会员类型',
        })
        return fasle;
      }
      wxRequst({
        data: { vipId: this.data.vipId, openId: res.data.openId },
        method: 'post',
        url: `${apiUrl}/viplist`
      }).then(res => {
        console.log(res);
        wxPayment({
          'timeStamp': res.data.package.timeStamp.toString(),
          'nonceStr': res.data.package.nonceStr,
          'package': res.data.package.package,
          'signType': 'MD5',
          'paySign': res.data.package.paySign,
        }).then(res => {
          this.onLoad();
        }).catch(res => {

        });
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    }).catch(res => { });

  }
})
