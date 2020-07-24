// pages/search/search.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
import { checkVip, checkMemeber, relationShip } from '../../utils/Biz'
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

    placeholoder: "搜索艺术家/藏家/作品",
    text01: "艺术家",
    text02: "藏家",
    text03: "作品",
    type: 0,
    result: 0,
    memberType: 0,
    resultInfo: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this)
  },
  textclick: function () {
    this.setData({
      placeholoder: '艺术家',
      type: 1,
      memberType: 0

    })
  },
  textclick02: function () {
    this.setData({
      placeholoder: '藏家',
      type: 1,
      memberType: 1

    })
  },
  textclick03: function () {
    this.setData({
      placeholoder: '作品',
      type: 2
    })
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
  searchSumbit: function (e) {
    if (this.data.type == 0) {
      wx.showToast({
        title: '选择搜索内容',
      })
      return false;
    }
    var that = this;
    wxRequst({
      data: { name: e.detail.value, type: this.data.type, memberType: this.data.memberType },
      url: `${apiUrl}/search`
    }).then(
      res => {
        if (res.data == null) {
          wx.showToast({
            title: '没有结果',
          })
          return false;
        }
        this.data.resultInfo = res.data;
        this.data.result = this.data.type;
        this.data.memberType = this.data.memberType;
        $digest(this);
      }).catch(
        res => {
          wx.showToast({
            title: '网络异常',
          })
        });
  },

})