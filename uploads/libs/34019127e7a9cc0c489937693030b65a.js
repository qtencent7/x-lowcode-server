/**
* 组件配置和属性值，默认需要导出一个模块
*/

export default {
  // 组件属性配置JSON
  attrs: [
    {
      type: 'Title',
      label: '基础设置',
      key: 'basic',
    },
    {
      type: 'Variable',
      label: '标题',
      name: ['title'],
    },
    {
      type: 'Select',
      label: '按钮类型',
      name: ['type'],
      props: {
        options: [
          { value: 'primary', label: 'primary' },
          { value: 'default', label: 'default' },
          { value: 'ghost', label: 'ghost' },
          { value: 'dashed', label: 'dashed' },
          { value: 'text', label: 'text' },
          { value: 'link', label: 'link' },
        ],
      },
    }
  ],
  config: {
    // 组件默认属性值
    props: {
      title: '股票分析图',
      type: 'primary',
    },
    // 组件样式
    style: {},
    // 事件
    events: [],
  },
  // 组件事件
  events: [],
  methods: [],
};
