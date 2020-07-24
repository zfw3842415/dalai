// pages/myactivity/myactivity.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
import { checkVip, checkMemeber, relationShip, favorite } from '../../utils/Biz'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const getStorge = promisify(wx.getStorage);
const setStorge = promisify(wx.setStorage);
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    currentData: 0,
    openId: '',
    mySendActivity: [],
    myJoinActivity: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    checkMemeber();
    getStorge({ key: 'openId' }).then(res => {
      this.data.openId = res.data.openId;
      wxRequst({
        data: { id: res.data.openId },
        url: `${apiUrl}/activity/myactive`
      }).then(res => {
        this.data.mySendActivity = res.data;
        $digest(this)
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    }).catch(res => { });
  },
  //点击切换
  clickTab: function (e) {
    var that = this;
    this.data.currentTab = e.target.dataset.current;
    if (e.target.dataset.current == 0) {
      wxRequst({
        data: { id: this.data.openId },
        url: `${apiUrl}/activity/myactive`
      }).then(res => {
        this.data.mySendActivity = res.data;
        $digest(this)
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    } else {
      wxRequst({
        data: { id: this.data.openId },
        url: `${apiUrl}/joins/myjoin`
      }).then(res => {
        this.data.myJoinActivity = res.data;
        $digest(this)
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

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
  viewActivityList: function (e) {
    let id = e.target.dataset.id;
    wx.navigateTo({
      url: `../activitylist/activitylist?id=${id}`,
    })
  }
})