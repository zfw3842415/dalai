// pages/personalInfo/personalInfo.js
import { promisify } from '../../utils/promise.util'
import { $init, $digest } from '../../utils/common.util'
import { apiUrl, imagesUrl } from '../../utils/config'
import { wxComUlit as wxUlit, formData as userinfo } from '../../utils/comUit'
const wxRequst = promisify(wx.request)
const wxLogin = promisify(wx.login)
const wxStorge = promisify(wx.setStorage)
const getStorge = promisify(wx.getStorage);
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['男', '女'],
    index: 0,
    array2: ['艺术家', '藏家'],
    index2: 0,
    type: 0,
    phone: 0,
    userinfo: [],
    ballList: [],
    edit: 0,
    ball: [],
    ballValue: [],
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindPickerChange2: function (e) {
    this.setData({
      index2: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    $init(this)
    if (options.type == 1) {
      this.data.type = 1;
      $digest(this);
      getStorge({ key: 'openId' }).then(res => {
        wxRequst({ data: null, method: 'GET', url: `${apiUrl}/members/${res.data.openId}` }).then(res => {
          console.log(res);
          this.data.index = +res.data.sex;
          this.data.index2 = +res.data.type;
          this.data.userinfo = res.data;
          this.data.edit = 1;
          let checkBox = res.data.ball;
          console.log(checkBox);
          let arr = checkBox.split(',');
          this.data.ball = arr;
          wxRequst({ data: null, method: 'GET', url: `${apiUrl}/balls` }).then(res => {
            this.data.ballList = res.data;
            console.log(res);
            for(let key in arr){
              for(let keyOne in this.data.ballList){
                if(this.data.ballList[keyOne].ball ==arr[key]){
                  this.data.ballList[keyOne]['checked'] ='true';
                }
              }
            }
            $digest(this);
          }).catch(res => {

          }); 
          $digest(this);
        }).catch(res => {

        });
      }).catch(res => {

      });

    } else {
      wxRequst({ data: null, method: 'GET', url: `${apiUrl}/balls` }).then(res => {
        this.data.ballList = res.data;
        console.log(res);
        $digest(this);
      }).catch(res => {

      });
    }

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
  getPhoneNumber(e) {
    var dataEncrptInfo = e.detail.encryptedData;
    var iv = e.detail.iv;
    var that = this;
    wxLogin().then(res => {
      wxRequst({
        data: {
          "encryptedData": dataEncrptInfo,
          "iv": iv,
          "code": res.code,
          "type": 1
        }, method: 'post', url: `${apiUrl}/weixin/decode`
      }).then(res => {
        let data = JSON.parse(res.data);
        this.data.phone = data.phoneNumber
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
        })
      });
    }).catch(res => {

    });
  },
  checkboxChange: function (e) {
    console.log(e);
    if (e.detail.value.length > 2) {
      let arr =[];
      for (let keyOne in this.data.ballList){
        this.data.ballList[keyOne]['checked'] = null;
      }
      for (let key in e.detail.value) {
        for (let keyOne in this.data.ballList) {
          if (key != 0) {
            console.log(this.data.ballList[keyOne])
            console.log(e.detail.value[key])
            if (this.data.ballList[keyOne].ball == e.detail.value[key]) {
            arr.push(this.data.ballList[keyOne].ball);
              this.data.ballList[keyOne]['checked'] = 'true';
            }
          }
        }
      }
      this.data.ball =arr;
      console.log(this.data.ball);
      $digest(this);
      wx.showToast({
        title: '仅能选择两个',
      })
      return false;
    } else {
      let arr = [];
      for (let key in e.detail.value) {
        arr.push(e.detail.value[key]);
      }
      this.data.ball = arr;
    }
  },
  formSubmit: function (e) {
    wxUlit.validation.length = 0;
    wxUlit.regexTest(/^\d{1,2}$/g, +e.detail.value.year, '请填写正确球龄');
    wxUlit.regexTest(/^\S{1,25}$/g, e.detail.value.moment, '签名格式不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.profession, '职业不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.expert, '擅长不正确');
    wxUlit.regexTest(/^\d{1,2}$/g, +e.detail.value.bestResult, '请填写正确球龄');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.favourite, '爱好不正确');
    wxUlit.regexTest(/^\S{2,25}$/g, e.detail.value.meno, '介绍不正确');
    if (this.data.phone == 0 && this.data.type!=1) {
      wx.showToast({
        title: '请获取手机号',
      })
      return false
    }
    if (wxUlit.validation.includes(false) > 0) {
      return false
    }
    userinfo.setData(e);
    let user_data = userinfo.getData();
    user_data['sex'] = this.data.index;
    user_data['type'] = this.data.index2;
    user_data['phone'] = this.data.phone;
    user_data['ball']=this.data.ball.toString();
    getStorge({ key: 'weixinInfo' }).then(res => {
      user_data['openId'] = res.data.openId;
      user_data['avatarUrl'] = res.data.avatarUrl;
      user_data['weixinNickName'] = res.data.nickName;
      console.log(user_data);
      let url = `${apiUrl}/members`;
      if (this.data.edit == 1) {
        url = `${apiUrl}/members/modify`
      }
      wxRequst({
        data: user_data,
        method: 'POST',
        url: url
      }).then(data => {
        if (data.data.id) {
          getStorge({ key: 'weixinInfo' }).then(res => {
            app.globalData.userInfo = res.data;
            console.log(app.globalData.userInfo);
            wxStorge({ 'key': 'openId', data: { openId: data.data.id } });
            wx.reLaunch({
              url: '../mine/mine'
            })
          }).catch(res => {
            wx.showToast({
              title: '提交成功',
            })
          });
        }
      }).catch(
        wx.showToast({
          title: '修改成功',
        })
      );
    }).catch(res => {

    })


  }
})