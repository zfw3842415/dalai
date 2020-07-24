// pages/master/master.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const getStorge = promisify(wx.getStorage);
const setStorge = promisify(wx.setStorage);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rookieList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    getStorge({ key: 'openId' }).then(
      res => {
        wxRequst(
          {
            data: { id: res.data.openId },
            url: `${apiUrl}/masters`
          }
        ).then(
          res => {
            this.data.rookieList = res.data;
            console.log(this.data.rookieList.length)
            $digest(this);
          }
        ).catch(
          res => {
          })
      }).catch(res => { })
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

  }
})