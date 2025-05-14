/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */

/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */

/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */

/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */
const { createEditor, createToolbar } = window.wangEditor

  const editorConfig = {
    placeholder: '发布文章内容...',
    onChange(editor) {
      const html = editor.getHtml()
      console.log('editor content', html)
        // 也可以同步到 <textarea>
        document.querySelector('.publish-content').value=html
    },
  }

  const editor = createEditor({
    selector: '#editor-container',
    html: '<p><br></p>',
    config: editorConfig,
    mode: 'default', // or 'simple'
  })

  const toolbarConfig = {}

  const toolbar = createToolbar({
    editor,
    selector: '#toolbar-container',
    config: toolbarConfig,
    mode: 'default', // or 'simple'
  })

const rounded = document.querySelector('.rounded')
const place=document.querySelector('.place')

function setChannleList() {
    axios({
        url:'/v1_0/channels'
    }).then(result => {
        document.querySelector('.form-select').innerHTML = '<option value="" selected>请选择文章频道</option>' + result.data.channels.map(item => `
            <option value="${item.id}">${item.name}</option>`).join('')
    }).catch(error => console.error('获取频道失败:', error))// 添加错误捕获)
}
setChannleList()

document.querySelector('.img-file').addEventListener('change', e => {
    const file = e.target.files[0]
    const fd = new FormData()
    fd.append('image', file)
    axios({
        url: '/v1_0/upload',
        method: 'post',
        data:fd
    }).then(result => {
        console.log(result)
        rounded.src=result.data.url
        rounded.classList.add('show')
        place.classList.add('hide')
    })
    document.querySelector('.rounded').addEventListener('click',()=>document.querySelector('.img-file').click())
})

async function getdata() {
    const form = document.querySelector('.art-form')
    const data = serialize(form, { hash: true, empty: true })
    if (data.id)
        data.cover = {
            type: rounded.src? 1:0,
            images: [rounded.src]
        }
    else delete data.id/*编辑文章需要，但是发布文章不需要*/
    try {
        await axios({
            url: data.id?`/v1_0/mp/articles/${data.id}`:'/v1_0/mp/articles',
            method: data.id?'put':'post',
            data
        })
        myAlert(true, data.id?'修改成功':'发布成功')
        form.reset()
        editor.setHtml('<p><br></p>')
        document.querySelector('.publish-content').value = ''/*隐藏输入框也清空*/
        rounded.src = ''
        rounded.classList.remove('show')
        place.classList.remove('hide')
    } catch (error) {
        console.log(error)
        myAlert(false, error.response.data.message)
    }
}
document.querySelector('.send').addEventListener('click', getdata)

; (function () {
    const paramStr = location.search
    const params = new URLSearchParams(paramStr)
    params.forEach(async (value, key) => {
        if (key === 'id')
        {
            document.querySelector('.title span').innerHTML = '修改文章'
            document.querySelector('.send').innerHTML = '修改'
            const result= await axios({
                url:`/v1_0/mp/articles/${value}`
            })
            Object.keys(result.data).forEach(key => {
                if (key === 'cover' && result.data[key].type) {
                    rounded.src = result.data[key].images[0]
                    rounded.classList.add('show')
                    place.classList.add('hide')
                }
                else if (key === 'content') {
                    editor.setHtml(result.data[key])
                    document.querySelector('.publish-content').value = result.data[key]
                }
                else if (key !=='pub_date') document.querySelector(`[name=${key}]`).value=result.data[key]
            })
        }
    })
})()