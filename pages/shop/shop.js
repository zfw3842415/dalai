// pages/shop/shop.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
const wxRequst = promisify(wx.request)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabTxt: ['全部'],//分类
    tab: [true, true],
    listClass: [{ 'title': '一级商家', id: 1 },
    { 'title': '二级商家', id: 2 },
    { 'title': '三级商家', id: 3 },
    { 'title': '其他商家', id: 4 }],
    imagesUrl: imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    $init(this);
    wxRequst({ data: null, url: `${apiUrl}/stores` }).then(res => {
      this.data.pinpaiList = res.data;
      $digest(this);
    }).catch(res => {
      wx.showToast({
        title: '网络异常',
      })
    });
  },// 选项卡
  filterTab: function (e) {
    var data = [true, true, true], index = e.currentTarget.dataset.index;
    data[index] = !this.data.tab[index];
    this.setData({
      tab: data
    })
  },
  //筛选项点击操作
  filter: function (e) {
    var self = this, id = e.currentTarget.dataset.id, txt = e.currentTarget.dataset.txt, tabTxt = this.data.tabTxt;
    tabTxt[0] = txt;
    self.setData({
      tab: [true, true, true],
      tabTxt: tabTxt,
      pinpai_id: id,
      pinpai_txt: txt
    });
    wxRequst({ data: { id: id }, url: `${apiUrl}/stores/filter` }).then(res => {
      this.data.pinpaiList = res.data;
      $digest(this);
    }).catch(res => {
      wx.showToast({
        title: '网络异常',
      })
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
  shopview: function (e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: `../shopshow/shopshow?id=${e.currentTarget.dataset.id}`,
    })
  }
})