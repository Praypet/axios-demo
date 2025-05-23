/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */

/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */

/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */

/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */

// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去
const queryobj = {
    status: '',
    channel_id: '',
    page: 1,
    per_page:2
}
let totalCount=0
async function setArticleList() {
    try {
        const res=await axios({
            url: '/v1_0/mp/articles',
            params:queryobj
        })
        totalCount = res.data.total_count
        document.querySelector('.total-count').innerHTML = `共${totalCount}条`
        document.querySelector('.page-item.page-now').innerHTML=`第${res.data.page}页`
        document.querySelector('.art-list').innerHTML=res.data.results.map(item=>`<tr>
            <td>
                <img
                src="${item.cover.images[0]||'https://img2.baidu.com/it/u=2640406343,1419332367&fm=253&fmt=auto&app=138&f=JPEG?w=708&h=500'}"
                alt="">
            </td>
            <td>${item.title}</td>
            <td>
                ${item.status === 1 ? '<span class="badge text-bg-primary">待审核</span>' : '<span class="badge text-bg-success">审核通过</span>'}
            </td>
            <td>
                <span>${item.pubdate}</span>
            </td>
            <td>
                <span>${item.read_count}</span>
            </td>
            <td>
                <span>${item.comment_count}</span>
            </td>
            <td>
                <span>${item.like_count}</span>
            </td>
            <td data-id="${item.id}">
                <i class="bi bi-pencil-square edit"></i>
                <i class="bi bi-trash3 del"></i>
            </td>
            </tr>`).join('')
    } catch (error){console.log(error)}
}
setArticleList()

function setChannleList() {
    axios({
        url:'/v1_0/channels'
    }).then(result => {
        document.querySelector('.form-select').innerHTML = '<option value="" selected>请选择文章频道</option>' + result.data.channels.map(item => `
            <option value="${item.id}">${item.name}</option>`).join('')
    }).catch(error => console.error('获取频道失败:', error))// 添加错误捕获)
}
setChannleList()

function selected(e) {
    const form = document.querySelector('.sel-form')
    const data = serialize(form, { hash: true, empty: true })
    queryobj.page=1
    queryobj.status = data.status
    queryobj.channel_id = data.channel_id
    setArticleList()
}
document.querySelector('.sel-btn').addEventListener('click',selected)

function nextpage() {
    if (queryobj.page  < Math.ceil(totalCount / queryobj.per_page)) {
        queryobj.page++
        setArticleList()
    }
}

function prepage() {
    if (queryobj.page  > 1) {
        queryobj.page--
        setArticleList()
    }
}

async function deleteArticle(e) {
    await axios({
        url: `/v1_0/mp/articles/${e.target.parentNode.dataset.id}`,
        method: 'delete',
    })
    const nowpage=Math.ceil((totalCount - 1)/ queryobj.per_page)||1
    if(nowpage<queryobj.page) queryobj.page=nowpage
    setArticleList()
}

async function modifyArticle(e) {
    location.href = `../publish/index.html?id=${e.target.parentNode.dataset.id}`
}

document.querySelector('.next').addEventListener('click', nextpage)
document.querySelector('.last').addEventListener('click', prepage)
document.querySelector('.art-list').addEventListener('click', e => {
    if (e.target.classList.contains('del')) deleteArticle(e)
    else if(e.target.classList.contains('edit')) modifyArticle(e)
})

const btn=document.querySelector('.mybox')
const modal=new bootstrap.Modal(btn)
document.querySelector('.quit').addEventListener('click',()=>{
    modal.show()
})
document.querySelector('.btn-secondary').addEventListener('click',()=>{
    localStorage.removeItem('token')
    modal.hide()
    setTimeout(()=>location.href='../login/index.html',500)
})