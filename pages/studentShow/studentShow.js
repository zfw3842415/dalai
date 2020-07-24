// pages/TeacherShow/TeacherShow.js
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
    userinfo: {},
    momentInfo: {},
    imgArr: [],
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
        wxRequst({
          data: {
            id: options.id,
            masterId: res.data.openId,
            type: 0,
          },
          url: `${apiUrl}/members/getinfo`
        }).then(
          res => {
            console.log(res.data);
            this.data.userinfo = res.data.memberInfo
            this.data.imgArr = res.data.memberImage
            this.data.momentInfo = res.data.moment
            this.data.relationshop = res.data.relationshop;
            $digest(this);
          }).catch(
            res => {
            });
      }).catch(
        res => {

        });

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
  zhaotu: function () {
    wx.showModal({
      title: '招徒',
      content: '确定发送招徒信息，需支付服务费￥150元，进度在个人中心消息中查看',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  callPhone: function (e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
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
  modalcnt:function(){
		wx.showModal({
      title: '提示',
			content: '感谢您对大来艺术博物馆的支持，为了您的资金安全，请联系大来博物馆官方热线400-88888888进行购买',
			success: function(res) {
				if (res.confirm) {
				console.log('用户点击确定')
				} else if (res.cancel) {
				console.log('用户点击取消')
				}
			}
		})
  },
  
  buy:function(){
		wx.showModal({
      title: '点赞金￥10',
			content: '对作品点赞，未来购买作品享受9.5折优惠，并抵扣画价。',
			success: function(res) {
				if (res.confirm) {
				console.log('用户点击确定')
				} else if (res.cancel) {
				console.log('用户点击取消')
				}
			}
		})
	}

})