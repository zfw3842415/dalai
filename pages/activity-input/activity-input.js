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
const wxUploadFile = promisify(wx.uploadFile)
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
  other:{
    images:[],
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
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log(res);
        const images = res.tempFilePaths[0]
        this.data.images.push(images)
        wx.compressImage({
          src: images,
          quality:80,
          success:res=>{
            console.log(res);
            this.other.images.push(res.tempFilePath)
          }
        })
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
    wxUlit.validation.length = 0;
    wxUlit.regexTest(/^\S{1,25}$/g, e.detail.value.activityName, '作品名不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.activityPos, '作品地点不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.activityInfo, '作品介绍不正确');
    wxUlit.regexTest(/^\d{1,}$/g, e.detail.value.activityDeposit, '作品费用不正确');
    if (wxUlit.validation.includes(false) > 0) {
      return false;
    }
    if (this.data.images.length == 0) {
      wx.showToast({
        title: '请选择图片',
      })
      return false;
    }
    activityInfo.setData(e);
    let activity_data = activityInfo.getData();
    activity_data['activityStartTime'] = this.data.dateTime1;
    getStorge({ key: 'openId' }).then(res => {
      activity_data['memberId'] = res.data.openId;
      wxRequst({ data: activity_data, method: 'post', url: `${apiUrl}/activity` }).then(res => {
        console.log(this.data.images);
        for (let path of this.data.images) {
          wxUploadFile({
            url: `${apiUrl}/activityimages`,
            filePath: path,
            name: 'activityImage',
            formData: {
              activityId: res.data.id
            }
          }).then(res => {
            let data = JSON.parse(res.data);
            if (data.status == 1) {
              wx.switchTab({
                url: '../activity/activity'
              })
            }
          })
        }
      }).catch(res => { })
    }).catch();

  }



})
