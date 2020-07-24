// pages/TeacherShow/TeacherShow.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { checkVip, checkMemeber, relationShip, favorite } from '../../utils/Biz'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
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
    userinfo: {},
    momentInfo: {},
    imgArr: [],
    rookieList: [],
    imagesUrl: imagesUrl,
    relationshop:0
  },
  previewImg: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    let parent = e.currentTarget.dataset.parent
    let imagesUrl = [];
    for (var key in that.data.momentInfo.imageUrl) {
      imagesUrl.push(`${that.data.imagesUrl}//${that.data.momentInfo.imageUrl[key]}`)
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
    getStorge({ key: 'openId' }).then(
      res => {
        wxRequst(
          {
            data: { 
              id: options.id,
              rookieId: res.data.openId,
              type: 1
              },
            url: `${apiUrl}/members/getinfo`
          }
        ).then(
          res => {
            console.log(res.data);
            this.data.userinfo = res.data.memberInfo
            this.data.imgArr = res.data.memberImage
            this.data.momentInfo = res.data.moment
            this.data.rookieList = res.data.rookieList
            this.data.relationShip = res.data.relationshop
            $digest(this);
          }).catch(
            res => {
            });
      }).catch();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  yaoyue: function () {
    wx.showModal({
      title: '提示',
      content: '人数已超额，本次邀请将支付98元',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  baishi: function () {
    wx.showModal({
      title: '拜师',
      content: '确定发送拜师信息，需支付服务费￥150元，进度在个人中心消息中查看',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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
  getRelation: function (e) {
    checkVip();
    relationShip(e);
  },
})