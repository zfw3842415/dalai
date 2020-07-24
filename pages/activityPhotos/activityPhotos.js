// pages/activityPhotos/activityPhotos.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    momentInfo: [],
    imagesUrl: imagesUrl
  },
  previewImg: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    let parent = e.currentTarget.dataset.parent
    let imagesUrl = [];
    console.log(that.data.momentInfo[parent].imageUrl)
    for (var key in that.data.momentInfo[parent].imageUrl) {
      imagesUrl.push(`${that.data.imagesUrl}//${that.data.momentInfo[parent].imageUrl[key]}`)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.src, //当前图片地址
      urls: imagesUrl, //所有要预览的图片的地址集合 数组形式
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    wxRequst({ data: { id: options.id }, url: `${apiUrl}/moments/getinfo` }).then(
      res => {
        this.data.momentInfo = res.data
        $digest(this);
      }).catch(
        res => {
        });
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