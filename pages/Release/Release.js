// pages/img/img.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as momentInfo } from '../../utils/comUit'
import { checkVip, checkMemeber, relationShip, favorite } from '../../utils/Biz'
const wxRequst = promisify(wx.request)
const wxUploadFile = promisify(wx.uploadFile)
const getStorge = promisify(wx.getStorage);
const setStorge = promisify(wx.setStorage);
Page({
  data: {
    images: [],
    focus: false,
    focusModel: true,
    openId: ''
  },
  onLoad(options) {
    $init(this);
    // 获取完整的年月日 时分秒，以及默认显示的数组
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },
  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(550).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true,
      focus: true,
      focusModel: false
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 10)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(500).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false,
        focus: false,
        focusModel: true,
        left: 0
      })
    }.bind(this), 200)

  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    });

  },
  chooseImage(e) {
    wx.chooseImage({
      count: 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 6 ? images : images.slice(0, 6)
        $digest(this)
      }
    })
  },

  removeImage(e) {
    const idx = e.target.dataset.idx
    this.data.images.splice(idx, 1)
    $digest(this)
  },

  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.images

    wx.previewImage({
      current: images[idx],
      urls: images,
    })
  },
  formSubmit: function (e) {
    checkVip();
    console.log(e.detail.value.content)
    wxUlit.validation.length = 0;
    wxUlit.regexTest(/^[\u4E00-\u9FA5]{1,120}$/g, e.detail.value.content, '内容不正确');
    if (this.data.images.length == 0) {
      wx.showToast({
        title: '请选择活动图片',
      })
      return false;
    }
    if (wxUlit.validation.includes(false) > 0) {
      return false;
    }

    momentInfo.setData(e);
    let moment_data = momentInfo.getData();

    getStorge({ key: 'openId' }).then(res => {
      moment_data['openId'] = res.data.openId;
      wxRequst(
        {
          data: moment_data,
          method: 'POST',
          url: `${apiUrl}/moments`
        }).then(res => {
          console.log(this.data.images);
          for (let path of this.data.images) {
            wxUploadFile({
              url: `${apiUrl}/momentimages`,
              filePath: path,
              name: 'monentImage',
              formData: {
                monentId: res.data.id
              }
            }).then(res => {
              let data = JSON.parse(res.data);
              if (data.status == 1) {
                wx.switchTab({
                  url: '../index/index'
                })
              }
            })
          }
        })
    }).catch(res => {
      wx.showToast({
        title: '网络异常',
      })
    });

  },

})
