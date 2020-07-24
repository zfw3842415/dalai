// pages/img/img.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const getStorge = promisify(wx.getStorage);
Page({
  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    imgArr: []
  },
  previewImg: function (e) {
    console.log(e.currentTarget.dataset.index);
    var index = e.currentTarget.dataset.index;
    var imgArr = this.data.imgArr;
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    getStorge({ key: 'openId' }).then(res => {
      console.log(res);
      let openId = res.data.openId;
      wxRequst({ data: { openId: openId }, method: 'GET', url: `${apiUrl}/images/getinfo` }).then(res => {
        console.log(res.data);
        for (let key in res.data) {
          let images = `${imagesUrl}//${res.data[key].imageUrl}`;
          this.data.imgArr.push(images);
        }
        $digest(this);
      }).catch(res => {

      });
    }).catch(res => {

    });
  },
  chooseImage(e) {

    $digest(this);
    wx.chooseImage({
      count: 6,

      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 6 ? images : images.slice(0, 6)
        this.data.imgArr = images
        $digest(this)
      }
    })
  },
  uploadImage(e) {
    getStorge({ key: 'openId' }).then(res => {
      let openId = res.data.openId;
      for (let path of this.data.images) {
        wxUploadFile({
          url: `${apiUrl}/images`,
          filePath: path,
          name: 'memberImage',
          formData: {
            id: openId
          }
        }).then(res => {
          this.data.images = [];
          this.data.imgArr = [];
          let data = JSON.parse(res.data)
          for (let key in data) {
            let images = `${imagesUrl}//${data[key].imageUrl}`;
            this.data.imgArr.push(images);
          }
          $digest(this);

        }).catch(res => { });
      }
    }).catch(res => {

    });
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
    this.data.images = [];
    this.data.imgArr = [];
    this.onLoad();
    $digest(this)
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