// pages/activity/activity.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as activityInfo } from '../../utils/comUit'
const wxRequst = promisify(wx.request)
const wxLogin = promisify(wx.login)
const wxStorge = promisify(wx.setStorage)
const getStorge = promisify(wx.getStorage);
const wxPayment = promisify(wx.requestPayment);
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    $init(this)
    wxRequst({
      data: null,
      url: `${apiUrl}/activity`
    }
    ).then(
      res => {
        this.data.activityList = res.data;
        $digest(this);
      }).catch(res => { });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  joinActivity: function (e) {
    getStorge({ key: 'openId' }).then(res => {
      wxRequst({ data: { activityId: e.currentTarget.dataset.index, activityPayment: e.currentTarget.dataset.price, openId:res.data.openId}, method: 'post', url: `${apiUrl}/join` }).then(res => {
        wxPayment({
          'timeStamp': res.data.package.timeStamp.toString(),
          'nonceStr': res.data.package.nonceStr,
          'package': res.data.package.package,
          'signType': 'MD5',
          'paySign': res.data.package.paySign,
        }).then(res => {
          wx.showToast({
            title: '参与成功...',
          })
          setTimeout(() => {
            wx.navigateBack({
              url: '../activity/activity'
            })
          }, 1000)
        }).catch(res => {

        });
      }).catch(res => { })
    }).catch();
  },
})