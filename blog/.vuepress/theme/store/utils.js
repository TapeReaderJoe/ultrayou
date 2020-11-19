import { get } from 'lodash'
import { map, toLower, getOr } from 'lodash/fp'

const pluckData = page => ({
  ...page,
  ...page.frontmatter,
  publish: page.frontmatter.publish ? new Date(page.frontmatter.publish).getTime() : null,
  tags: get(page.frontmatter, 'tags', []).map(toLower),
  categories: get(page.frontmatter, 'categories', []).map(toLower)
})

const isExternal = url => /^https?:\/\//i.test(url)

export const formatPages = map(pluckData)

export const formatPage = pluckData

export const relativePath = state => {
  const route = get(state, 'route.path', '/')
  const base = get(state, 'blog.path', '')
  //console.log( route.replace(base, ''))
  return route.replace(base, '')
}

export const type = state => {
  const path = relativePath(state)
  console.log(path)
  const type = get(state, 'current.type')
  const [group] = path.split('/').filter(tag => !!tag)

  if (type) {
    return type
  }

  switch (group) {
    case 'tags':
      return 'tags'

    case 'category':
      return 'category'

    case 'posts':
      return 'posts'
    
    case 'books':
      return 'books'

    default:
      return 'home'
  }
}

export const category = getOr(null, 'route.params.category')
export const tag = getOr(null, 'route.params.tag')

export const footer = state =>
  get(state, 'blog.footer', [])
    .map(nav => ({
      ...nav,
      external: isExternal(nav.link)
    }))

export const navigation = state =>
  get(state, 'blog.nav', [])
    .map(nav => ({
      ...nav,
      active: state.route.path.split('/').join('') === nav.link.split('/').join(''),
      external: isExternal(nav.link)
    }))


export const social = site => {
  const channels = get(site, 'themeConfig.social', {})

  return Object.keys(channels)
    .reduce((results, type) => [
      ...results,
      {
        type,
        url: channels[type]
      }
    ], [])

}

export const posts = state => {
  const items = Object.keys(state.index)

  return items
    .map(item => state.index[item])
    .filter(item => !!item)
    .filter(item => item.type === 'post')
    .filter(item => !category(state) || ~item.categories.map(toLower).indexOf(toLower(category(state))))
    .filter(item => !tag(state) || ~item.tags.map(toLower).indexOf(toLower(tag(state))))
    .sort((a, b) => a - b)
    .slice(0, state.type === 'home' ? 10 : 50)
}

export const books = state => {
  const items = Object.keys(state.index)

  return items
    .map(item => state.index[item])
    .filter(item => !!item)
    .filter(item => item.type === 'book')
}


export const header = state => {
  switch (state.type) {
    case 'category':
      return {
        showCover: true,
        coverImage: null,
        title: category(state),
        description: `En samling av ${state.posts.length} ${state.posts.length === 1 ? 'post' : 'artiklar'}`
      }

    case 'tags':
      return {
        showCover: true,
        coverImage: null,
        title: tag(state),
        description: `En samling av ${state.posts.length} ${state.posts.length === 1 ? 'tag' : 'taggar'}`
      }

    case 'posts':
      return {
        showCover: true,
        coverImage: null,
        title: `Artiklar`,
        description: `En samling av ${state.posts.length} ${state.posts.length === 1 ? 'artikel' : 'artiklar'}`
      }
    
    case 'books':
      return {
        showCover: true,
        coverImage: null,
        title: `Bibliotek`,
        description: `En samling av ${state.books.length} ${state.books.length === 1 ? 'bok' : 'böcker'}`
      }

    case 'home':
      return {
        logo: state.blog.logo,
        showCover: true,
        coverImage: state.blog.cover,
        title: state.blog.title,
        description: state.blog.description
      }

    default:
      return {
        showCover: false,
        coverImage: null,
        title: null,
        description: null
      }
  }
}
