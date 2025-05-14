// axios 公共配置
// 基地址
axios.defaults.baseURL = 'http://geek.itheima.net'

axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token')  
    token && (config.headers.Authorization = `Bearer ${token}`)
    // 在发送请求之前做些什么
    return config
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
})
  
axios.interceptors.response.use(function (response) {
  return response.data
}, function (error) {
  if (error?.response?.status === 401) {
    alert('登录状态已过期，请重新登录')
    localStorage.clear()
    location.href='../login/index.html'
  }
  return Promise.reject(error)
  /*在这里之所以要return reject而上面不需要的原因是，前一个是成功时调用，后一个是失败时调用
  如果在后面不指明是reject那么我们返回的就不是错误信息了，它会默认调用resolve
  如果拦截器不返回 reject，控制台不会显示未处理的错误（静默失败），增加调试难度*/
})