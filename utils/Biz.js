import { promisify } from 'promise.util'
import { apiUrl, imagesUrl } from 'config'
import { $init, $digest } from 'common.util'
const getStorge = promisify(wx.getStorage);
const wxRequst = promisify(wx.request)
const wxPayment = promisify(wx.requestPayment);
export function checkVip() {
  getStorge({ key: 'openId' }).then(res => {
    wxRequst({
      data: { id: res.data.openId }, url: `${apiUrl}/viplist/checkvip`
    }).then(res => {
      if (res.status == 0) {
        wx.showModal({
          title: '请先到个人中心充值会员',
        })
        return false;
      } else {
        return true;
      }
    })
  }).catch(res => { });
}

export function checkMemeber() {
  getStorge({ key: 'openId' }).then(res => {
    return true;
  }).catch(res => {
    wx.showModal({
      title: '请先到个人中心授权获取微信信息',
    })
  });
}

export function checkType(type) {
  getStorge({ key: 'openId' }).then(res => {
    wxRequst({
      data: { id: res.data.openId }, url: `${apiUrl}/members/getone`
    }).then(res => {
      console.log(res)
      if (res.data.type == "2") {
        wx.showModal({
          title: '游客不能发布',
        })
        return false;
      } else {
        if(type==0){
          wx.navigateTo({
            url: '/pages/Release/Release',
          })
        }else{
          wx.navigateTo({
            url: '/pages/activity-input/activity-input',
          })
        }
       
      }
  }).catch(res => {
  });
})
}
export function relationShip(e) {
  let type = e.currentTarget.dataset.type;
  let relationId = e.currentTarget.dataset.rid

  getStorge({ key: 'openId' }).then(res => {
    if (relationId == res.data.openId) {
      wx.showToast({
        title: '不能对自己发起这项操作',
      })
      return false;
    }
    let data = {
      'id': res.data.openId,
      'relationId': relationId,
      'type': type
    };
    wxRequst({
      data: data,
      method: 'post',
      url: `${apiUrl}/relationships`
    }).then(res => {
      if (res.data.status == 1) {
        wx.showToast({
          title: '发出请求成功',
        })
      } else if (res.data.status == 2) {
        wx.showToast({
          title: '已达每日操作上限',
        })
      } else {
        wx.showToast({
          title: '已发出请求',
        })
      }
    }).catch(res => {
      wx.showToast({
        title: '网络异常',
      })
    })
  }).catch(res => { });
}

export function favorite(e, page) {
  let favoriteId = e.currentTarget.dataset.rid
  getStorge({ key: 'openId' }).then(res => {
    if (favoriteId == res.data.openId) {
      wx.showToast({
        title: '不能对自己发起这项操作',
      })
      return false;
    }
    let data = {
      'id': res.data.openId,
      'favouriteId': favoriteId,

    };
    wxRequst({
      data: data,
      method: 'post',
      url: `${apiUrl}/favorites`
    }).then(res => {
      if (res.data.status == 1) {
        $digest(page);
      } else {
        wxPayment({
          'timeStamp': res.data.package.timeStamp.toString(),
          'nonceStr': res.data.package.nonceStr,
          'package': res.data.package.package,
          'signType': 'MD5',
          'paySign': res.data.package.paySign,
        }).then(res => {
          $digest(page);
        }).catch(res => {
        });
      }
    }).catch(res => {
      wx.showToast({
        title: '网络异常',
      })
    })
  }).catch(res => { })
}

