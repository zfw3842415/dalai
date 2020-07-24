var dateTimePicker = require('../../utils/dateTimePicker.js');
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as activityInfo } from '../../utils/comUit'
const wxRequst = promisify(wx.request)
const wxLogin = promisify(wx.login)
const wxStorge = promisify(wx.setStorage)
const getStorge = promisify(wx.getStorage);
const wxPayment = promisify(wx.requestPayment);
const app = getApp()
Page({
  data: {

    images: [],
    date: '2018-10-01',
    time: '12:00',
    dateTimeArray: null,
    dateTime: null,
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2000,
    endYear: 2050,
    focus: false,
    focusModel: true,
  },
  onLoad(options) {
    $init(this);
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    this.data.dateTime = obj.dateTime;
    this.data.dateTimeArray = obj.dateTimeArray;
    this.data.dateTime1 = `${this.data.dateTimeArray[0][this.data.dateTime[0]]}-${this.data.dateTimeArray[1][this.data.dateTime[1]]}-${this.data.dateTimeArray[2][this.data.dateTime[2]]} ${this.data.dateTimeArray[3][this.data.dateTime[3]]}:${this.data.dateTimeArray[4][this.data.dateTime[4]]}:${this.data.dateTimeArray[5][this.data.dateTime[5]]}`
    console.log(this.data.dateTime1);
    $digest(this);
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.data.dateTimeArray = dateArr;
    this.data.dateTime = arr;
    this.data.dateTime1 = `${this.data.dateTimeArray[0][this.data.dateTime[0]]}-${this.data.dateTimeArray[1][this.data.dateTime[1]]}-${this.data.dateTimeArray[2][this.data.dateTime[2]]} ${this.data.dateTimeArray[3][this.data.dateTime[3]]}:${this.data.dateTimeArray[4][this.data.dateTime[4]]}:${this.data.dateTimeArray[5][this.data.dateTime[5]]}`

    $digest(this);
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
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths)
        this.data.images = images.length <= 3 ? images : images.slice(0, 3)
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

  submitForm(e) {
    const title = this.data.title
    const content = this.data.content

    if (title && content) {
      const arr = []

      for (let path of this.data.images) {
        arr.push(wxUploadFile({
          url: config.urls.question + '/image/upload',
          filePath: path,
          name: 'qimg',
        }))
      }

      wx.showLoading({
        title: '正在创建...',
        mask: true
      })

      Promise.all(arr).then(res => {
        return res.map(item => JSON.parse(item.data).url)
      }).catch(err => {
        console.log(">>>> upload images error:", err)
      }).then(urls => {
        return createQuestion({
          title: title,
          content: content,
          images: urls
        })
      }).then(res => {
        const pages = getCurrentPages();
        const currPage = pages[pages.length - 1];
        const prevPage = pages[pages.length - 2];

        prevPage.data.questions.unshift(res)
        $digest(prevPage)

        wx.navigateBack()
      }).catch(err => {
        console.log(">>>> create question error:", err)
      }).then(() => {
        wx.hideLoading()
      })
    }

    wx.showModal({
      title: '押金',
      content: '确定发送活动信息？需支付押金￥150元',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })



  },
  formSubmit: function (e) {
    wxUlit.validation.length = 0;
    wxUlit.regexTest(/^\S{1,25}$/g, e.detail.value.activityName, '活动名不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.activityPos, '活动地点不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.activityInfo, '活动介绍不正确');
    wxUlit.regexTest(/^\d{1,}$/g, e.detail.value.activityDeposit, '活动费用不正确');
    if (wxUlit.validation.includes(false) > 0) {
      return false;
    }
    if (e.detail.value.activityDeposit < 100 && e.detail.value.activityDeposit != 0) {
      wx.showToast({
        title: '活动费用不能低于100元',
      })
      return false;
    }
    activityInfo.setData(e);
    let activity_data = activityInfo.getData();
    activity_data['activityStartTime'] = this.data.dateTime1;
    getStorge({ key: 'openId' }).then(res => {
      activity_data['memberId'] = res.data.openId;
      wxRequst({ data: activity_data, method: 'post', url: `${apiUrl}/activity` }).then(res => {
        wxPayment({
          'timeStamp': res.data.package.timeStamp.toString(),
          'nonceStr': res.data.package.nonceStr,
          'package': res.data.package.package,
          'signType': 'MD5',
          'paySign': res.data.package.paySign,
        }).then(res => {
          wx.showToast({
            title: '等待审核..',
          })
          setTimeout(() => {
            wx.navigateBack({
              url: '../activity/activity'
            })
          }, 1000)
        }).catch(res => {

        });
      }).catch(res => { })
    }).catch();

  }



})
