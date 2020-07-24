// pages/newshow/newshow.js
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
    relationShipInfo: '',
    relativeId: '',
    status: 0,
    rid: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    this.data.relativeId = options.id;
    wxRequst({ data: { id: options.id }, url: `${apiUrl}/message/getrelinfo` }).then(res => {
      this.data.relationShipInfo = res.data;
      getStorge({ key: 'openId' }).then(res => {
        wxRequst({ data: { id: res.data.openId, relationId: this.data.relativeId }, method: 'get', url: `${apiUrl}/relationships/getstatus` }).then(res => {
          this.data.status = res.data.status;
          this.data.rid = res.data.rid;
          $digest(this);
        }).catch();
      }).catch();

    }).catch();
  },
  buttonInfo: function (e) {
    let value = e.target.dataset.type;
    getStorge({ key: 'openId' }).then(res => {
      wxRequst({ data: { id: res.data.openId, relationId: this.data.relativeId, status: value }, method: 'post', url: `${apiUrl}/relationships/modify` }).then(res => {
        this.data.relationShipInfo = res.data;
        $digest(this);
      }).catch();
    }).catch();

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
  viewInfo: function (e) {
    let rid = e.target.dataset.id;
    wx.navigateTo({
      url: `../contact/contact?id=${rid}`,
    })
  }
})