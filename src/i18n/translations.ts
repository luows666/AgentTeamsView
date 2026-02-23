/**
 * Translation Content
 * All UI text translations for English and Chinese
 */

export type Language = 'en' | 'zh';

// Translation keys type
export type TranslationKeys =
  // General
  | 'appTitle'
  | 'save'
  | 'load'
  | 'export'
  | 'apply'
  | 'cancel'
  | 'close'
  | 'clear'
  | 'refresh'
  | 'settings'
  | 'language'
  | 'selectLanguage'

  // Agent Panel
  | 'agentPanel'
  | 'agentManagement'
  | 'addAgent'
  | 'editAgent'
  | 'newAgent'
  | 'update'
  | 'delete'
  | 'edit'
  | 'total'
  | 'active'
  | 'commander'
  | 'none'
  | 'agentName'
  | 'role'
  | 'systemPrompt'
  | 'note'
  | 'noteOptional'
  | 'pause'
  | 'start'
  | 'setCmd'
  | 'cmd'
  | 'status'
  | 'working'
  | 'idle'
  | 'error'
  | 'offline'

  // Task Panel
  | 'taskBoard'
  | 'addTask'
  | 'newTask'
  | 'title'
  | 'description'
  | 'priority'
  | 'assignTo'
  | 'assignToOptional'
  | 'unassigned'
  | 'toDo'
  | 'inProgress'
  | 'done'
  | 'startTask'
  | 'complete'
  | 'reopen'
  | 'created'
  | 'updated'
  | 'assignedTo'
  | 'totalTasks'
  | 'noTasks'
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'pending'
  | 'completed'

  // Message Panel
  | 'messageStream'
  | 'messages'
  | 'noMessagesYet'
  | 'live'
  | 'all'
  | 'tasks'

  // Formation Panel
  | 'formationControl'
  | 'selectFormation'
  | 'preview'
  | 'workloadHeatmap'
  | 'showAgentDistribution'
  | 'legend'
  | 'idle'
  | 'busy'
  | 'circle'
  | 'matrix'
  | 'triangle'
  | 'herring'
  | 'circleDesc'
  | 'matrixDesc'
  | 'triangleDesc'
  | 'herringDesc'

  // Settings Panel
  | 'llmProvider'
  | 'apiKey'
  | 'show'
  | 'hide'
  | 'model'
  | 'currentConfiguration'
  | 'provider'
  | 'notSet'
  | 'leaveEmptyForLocal'
  | 'apiKeyStoredLocally'
  | 'settingsSaved'
  | 'settingsLoaded'
  | 'failedToLoadSettings'
  | 'noSavedSettings'
  | 'settingsExported'
  | 'settingsApplied'
  | 'applySettings'
  | 'customProvider'
  | 'customModelName'
  | 'customBaseUrl'
  | 'customBaseUrlHint'
  | 'savedConfigs'
  | 'customConfigs'
  | 'saveCurrentConfig'
  | 'configName'
  | 'enterConfigName'
  | 'noSavedConfigs'
  | 'noCustomConfigs'
  | 'configSaved'
  | 'configDeleted'
  | 'configLoaded'
  | 'confirmDelete'
  | 'switchConfig'
  | 'current'

  // Status Panel
  | 'systemStatus'
  | 'totalAgents'
  | 'system'
  | 'online'

  // Controls / Instructions
  | 'controls'
  | 'leftClick'
  | 'selectAgent'
  | 'drag'
  | 'rotateView'
  | 'scroll'
  | 'zoomInOut'
  | 'rightDrag'
  | 'panView'

  // Activity Log
  | 'activityLog'
  | 'systemInitialized'
  | 'loadedAgents'
  | 'rendering3DScene'
  | 'selected'

  // Other
  | 'viewDetails'
  | 'activate'
  | 'hideTasks'
  | 'showTasks'
  | 'hideMessages'
  | 'showMessages'
  | 'hideSettings'

  // Chat
  | 'chatWithCommander'
  | 'chat'
  | 'typeMessage'
  | 'send'
  | 'quickCommands'
  | 'cmdStatus'
  | 'cmdFormation'
  | 'cmdTasks'
  | 'hideChat'
  | 'showChat';

// Translations object
export const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    // General
    appTitle: 'Agent Team',
    save: 'Save',
    load: 'Load',
    export: 'Export',
    apply: 'Apply',
    cancel: 'Cancel',
    close: 'Close',
    clear: 'Clear',
    refresh: 'Refresh',
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',

    // Agent Panel
    agentPanel: 'AGENT PANEL',
    agentManagement: 'Agent Management',
    addAgent: '+ Add Agent',
    editAgent: 'Edit Agent',
    newAgent: 'New Agent',
    update: 'Update',
    delete: 'Delete',
    edit: 'Edit',
    total: 'Total',
    active: 'Active',
    commander: 'Commander',
    none: 'None',
    agentName: 'Agent Name',
    role: 'Role',
    systemPrompt: 'System Prompt',
    note: 'Note',
    noteOptional: 'Note (optional)',
    pause: 'Pause',
    start: 'Start',
    setCmd: 'Set CMD',
    cmd: 'CMD',
    status: 'Status',
    working: 'Working',
    idle: 'Idle',
    error: 'Error',
    offline: 'Offline',
    selectCustomConfig: 'Custom Config',
    useGlobalSettings: 'Use Global Settings',
    noCustomConfigsHint: 'Create custom configs in Settings first',

    // Task Panel
    taskBoard: 'Task Board',
    addTask: '+ Add Task',
    newTask: 'New Task',
    title: 'Title',
    description: 'Description',
    priority: 'Priority',
    assignTo: 'Assign To',
    assignToOptional: 'Assign To (Optional)',
    unassigned: 'Unassigned',
    toDo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    startTask: 'Start Task',
    complete: 'Complete',
    reopen: 'Reopen',
    created: 'Created',
    updated: 'Updated',
    assignedTo: 'Assigned To',
    totalTasks: 'total tasks',
    noTasks: 'No tasks',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    pending: 'Pending',
    completed: 'Completed',

    // Message Panel
    messageStream: 'Message Stream',
    messages: 'Messages',
    noMessagesYet: 'No messages yet',
    live: 'LIVE',
    all: 'All',
    tasks: 'Tasks',

    // Formation Panel
    formationControl: 'Formation Control',
    selectFormation: 'Select Formation',
    preview: 'Preview',
    workloadHeatmap: 'Workload Heatmap',
    showAgentDistribution: 'Show agent task distribution',
    legend: 'Legend',
    idle: 'Idle',
    busy: 'Busy',
    circle: 'Circle',
    matrix: 'Matrix',
    triangle: 'Triangle',
    herring: 'Herring',
    circleDesc: 'Agents arranged in a circle around the commander',
    matrixDesc: 'Grid-style formation for organized positioning',
    triangleDesc: 'Triangle formation with commander at apex',
    herringDesc: 'Linear formation with branching pattern',

    // Settings Panel
    llmProvider: 'LLM Provider',
    apiKey: 'API Key',
    show: 'SHOW',
    hide: 'HIDE',
    model: 'Model',
    currentConfiguration: 'Current Configuration',
    provider: 'Provider',
    notSet: 'Not set',
    leaveEmptyForLocal: 'Leave empty for local Ollama',
    apiKeyStoredLocally: 'Your API key is stored locally',
    settingsSaved: 'Settings saved successfully!',
    settingsLoaded: 'Settings loaded from storage!',
    failedToLoadSettings: 'Failed to load settings',
    noSavedSettings: 'No saved settings found',
    settingsExported: 'Settings exported to storage!',
    settingsApplied: 'Settings applied! LLM provider updated.',
    applySettings: 'Apply Settings',
    customProvider: 'Custom LLM',
    customModelName: 'Model Name',
    customBaseUrl: 'Base URL',
    customBaseUrlHint: 'Enter the API endpoint URL (e.g., https://api.example.com/v1)',
    savedConfigs: 'Saved Configurations',
    customConfigs: 'Custom Configurations',
    saveCurrentConfig: 'Save Current Config',
    configName: 'Configuration Name',
    enterConfigName: 'Enter a name for this configuration...',
    noSavedConfigs: 'No saved configurations',
    noCustomConfigs: 'No custom configurations',
    configSaved: 'Configuration saved!',
    configDeleted: 'Configuration deleted',
    configLoaded: 'Configuration loaded',
    confirmDelete: 'Are you sure you want to delete this configuration?',
    switchConfig: 'Switch',
    current: 'Current',

    // Status Panel
    systemStatus: 'System Status',
    totalAgents: 'Total Agents',
    working: 'Working',
    idle: 'Idle',
    system: 'System',
    online: 'Online',

    // Controls / Instructions
    controls: 'Controls',
    leftClick: 'Left Click',
    selectAgent: 'Select Agent',
    drag: 'Drag',
    rotateView: 'Rotate View',
    scroll: 'Scroll',
    zoomInOut: 'Zoom In/Out',
    rightDrag: 'Right Drag',
    panView: 'Pan View',

    // Activity Log
    activityLog: 'Activity Log',
    systemInitialized: 'System initialized',
    loadedAgents: 'Loaded {count} agents',
    rendering3DScene: 'Rendering 3D scene',
    selected: 'Selected: {name}',

    // Other
    viewDetails: 'View Details',
    activate: 'Activate',
    hideTasks: 'Hide Tasks',
    showTasks: 'Task Board',
    hideMessages: 'Hide Messages',
    showMessages: 'Messages',
    hideSettings: 'Hide Settings',

    // Chat
    chatWithCommander: 'Chat with Commander',
    chat: 'Chat',
    typeMessage: 'Type your message...',
    send: 'Send',
    quickCommands: 'Quick Commands',
    cmdStatus: 'Status',
    cmdFormation: 'Formation',
    cmdTasks: 'Tasks',
    hideChat: 'Hide Chat',
    showChat: 'Chat',
  },

  zh: {
    // General
    appTitle: '智能体团队',
    save: '保存',
    load: '加载',
    export: '导出',
    apply: '应用',
    cancel: '取消',
    close: '关闭',
    clear: '清除',
    refresh: '刷新',
    settings: '设置',
    language: '语言',
    selectLanguage: '选择语言',

    // Agent Panel
    agentPanel: '智能体面板',
    agentManagement: '智能体管理',
    addAgent: '+ 添加智能体',
    editAgent: '编辑智能体',
    newAgent: '新建智能体',
    update: '更新',
    delete: '删除',
    edit: '编辑',
    total: '总计',
    active: '活跃',
    commander: '指挥官',
    none: '无',
    agentName: '智能体名称',
    role: '角色',
    systemPrompt: '系统提示',
    note: '备注',
    noteOptional: '备注（可选）',
    pause: '暂停',
    start: '启动',
    setCmd: '设为指挥',
    cmd: '指挥',
    status: '状态',
    working: '工作中',
    idle: '空闲',
    error: '错误',
    offline: '离线',
    selectCustomConfig: '自定义配置',
    useGlobalSettings: '使用全局设置',
    noCustomConfigsHint: '请先在设置中创建自定义配置',

    // Task Panel
    taskBoard: '任务面板',
    addTask: '+ 添加任务',
    newTask: '新任务',
    title: '标题',
    description: '描述',
    priority: '优先级',
    assignTo: '分配给',
    assignToOptional: '分配给（可选）',
    unassigned: '未分配',
    toDo: '待办',
    inProgress: '进行中',
    done: '已完成',
    startTask: '开始任务',
    complete: '完成',
    reopen: '重新打开',
    created: '创建时间',
    updated: '更新时间',
    assignedTo: '分配给',
    totalTasks: '个任务',
    noTasks: '暂无任务',
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
    pending: '待处理',
    completed: '已完成',

    // Message Panel
    messageStream: '消息流',
    messages: '消息',
    noMessagesYet: '暂无消息',
    live: '在线',
    all: '全部',
    tasks: '任务',

    // Formation Panel
    formationControl: '阵型控制',
    selectFormation: '选择阵型',
    preview: '预览',
    workloadHeatmap: '工作负载热力图',
    showAgentDistribution: '显示智能体任务分布',
    legend: '图例',
    idle: '空闲',
    busy: '忙碌',
    circle: '圆形',
    matrix: '矩阵',
    triangle: '三角形',
    herring: '人字形',
    circleDesc: '智能体围绕指挥官呈圆形排列',
    matrixDesc: '网格状阵型，适合有序部署',
    triangleDesc: '三角形阵型，指挥官位于顶点',
    herringDesc: '线性阵型，带分支模式',

    // Settings Panel
    llmProvider: '大语言模型提供商',
    apiKey: 'API密钥',
    show: '显示',
    hide: '隐藏',
    model: '模型',
    currentConfiguration: '当前配置',
    provider: '提供商',
    notSet: '未设置',
    leaveEmptyForLocal: '本地Ollama留空',
    apiKeyStoredLocally: '您的API密钥存储在本地',
    settingsSaved: '设置保存成功！',
    settingsLoaded: '设置已从存储加载！',
    failedToLoadSettings: '加载设置失败',
    noSavedSettings: '未找到保存的设置',
    settingsExported: '设置已导出到存储！',
    settingsApplied: '设置已应用！大语言模型提供商已更新。',
    applySettings: '应用设置',
    customProvider: '自定义LLM',
    customModelName: '模型名称',
    customBaseUrl: 'Base URL',
    customBaseUrlHint: '输入API端点URL（如 https://api.example.com/v1）',
    savedConfigs: '已保存的配置',
    customConfigs: '自定义配置',
    saveCurrentConfig: '保存当前配置',
    configName: '配置名称',
    enterConfigName: '输入此配置的名称...',
    noSavedConfigs: '暂无保存的配置',
    noCustomConfigs: '暂无自定义配置',
    configSaved: '配置已保存！',
    configDeleted: '配置已删除',
    configLoaded: '配置已加载',
    confirmDelete: '确定要删除此配置吗？',
    switchConfig: '切换',
    current: '当前',

    // Status Panel
    systemStatus: '系统状态',
    totalAgents: '智能体总数',
    working: '工作中',
    idle: '空闲',
    system: '系统',
    online: '在线',

    // Controls / Instructions
    controls: '操作说明',
    leftClick: '左键点击',
    selectAgent: '选择智能体',
    drag: '拖拽',
    rotateView: '旋转视角',
    scroll: '滚轮',
    zoomInOut: '缩放',
    rightDrag: '右键拖拽',
    panView: '平移视角',

    // Activity Log
    activityLog: '活动日志',
    systemInitialized: '系统已初始化',
    loadedAgents: '已加载 {count} 个智能体',
    rendering3DScene: '正在渲染3D场景',
    selected: '已选择：{name}',

    // Other
    viewDetails: '查看详情',
    activate: '激活',
    hideTasks: '隐藏任务',
    showTasks: '任务面板',
    hideMessages: '隐藏消息',
    showMessages: '消息',
    hideSettings: '隐藏设置',

    // Chat
    chatWithCommander: '与指挥官聊天',
    chat: '聊天',
    typeMessage: '输入您的消息...',
    send: '发送',
    quickCommands: '快捷指令',
    cmdStatus: '状态',
    cmdFormation: '阵型',
    cmdTasks: '任务',
    hideChat: '隐藏聊天',
    showChat: '聊天',
  },
};

export default translations;
