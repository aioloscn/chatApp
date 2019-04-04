window.app = {
	
	/**
	 * 后端服务发布的url地址
	 */
	serverUrl: 'http://172.18.3.11:8080',
	
	/**
	 * netty服务后端发布的url地址
	 */
	nettyServerUrl: 'ws://172.18.3.11:8088/ws',
	
	/**
	 * 图片服务器的url地址
	 */
	imgServerUrl: 'http://188.131.240.181:88/aiolos/',
	/**
	 * 判断字符串是否为空
	 * true：不为空
	 * false：为空
	 */
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},
	/**
	 * 封装消息提示框，默认mui的不支持居中和自定义icon，所以使用h5+
	 */
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, {icon: "image/" + type + ".png", verticalAlign: "center"})
	},
	/**
	 * 获取用户的全局对象
	 */
	getUserGlobalInfo: function() {
		var userInfoStr = plus.storage.getItem("userInfo");
		return JSON.parse(userInfoStr);
	},
	/**
	 * 保存用户的全局对象
	 */
	setUserGlobalInfo: function(user) {
		var userInfoStr = JSON.stringify(user);
		plus.storage.setItem("userInfo", userInfoStr);
	},
	
	/**
	 * 登出后，移除用户全局对象
	 */
	userLogout: function() {
		plus.storage.removeItem("userInfo");
	},
	
	/**
	 * 保存用户的联系人列表
	 */
	setContactList: function(contactList) {
		var contactListStr = JSON.stringify(contactList);
		plus.storage.setItem('contactList', contactListStr);
	},
	
	/**
	 * 获取本地缓存中的联系人列表
	 */
	getContactList: function() {
		var contactListStr = plus.storage.getItem('contactList');
		
		if (!this.isNotNull(contactListStr))
			return [];
			
		return JSON.parse(contactListStr);
	},
	
	/**
	 * 根据用户id，从本地缓存（联系人列表）中获取朋友的信息
	 */
	getFriendFormContactList: function(friendId) {
		var contactListStr = plus.storage.getItem('contactList');
		
		if (this.isNotNull(contactListStr)) {
			
			var contactList = JSON.parse(contactListStr);
			for (var i = 0; i < contactList.length; i ++) {
				var friend = contactList[i];
				if (friend.friendUserId == friendId) {
					return friend;
					break;
				}
			}
		} else {
			return null;
		}
	},
	
	/**
	 * 保存聊天记录
	 * @param {Object} flag 判断这条消息是谁发送的，1：我 2：好友
	 */
	saveUserChatHistory: function(myId, friendId, msg, flag) {
		var me = this;
		var chatKey = 'chat-' + myId + '-' + friendId;
		
		// 从本地缓存获取聊天记录查看是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} else {
			chatHistoryList = [];
		}
		
		// 向list中追加msg对象
		var singleMsg = new me.ChatHistory(myId, friendId, msg, flag);
		chatHistoryList.push(singleMsg);
		
		plus.storage.setItem(chatKey, JSON.stringify(chatHistoryList));
	},
	
	/**
	 * 从缓存中获取聊天记录
	 */
	getUserChatHistory: function(myId, friendId) {
		var me = this;
		var chatKey = 'chat-' + myId + '-' + friendId;
		
		// 从本地缓存获取聊天记录查看是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey);
		
		var chatHistoryList;
		if (me.isNotNull(chatHistoryListStr)) {
			chatHistoryList = JSON.parse(chatHistoryListStr);
		} else {
			chatHistoryList = [];
		}
		
		return chatHistoryList;
	},
	
	/**
	 * 删除聊天记录
	 */
	deleteUserChatHistory: function(myId, friendId) {
		var chatKey = 'chat-' + myId + '-' + friendId;
		plus.storage.removeItem(chatKey);
	},
	
	/**
	 * 聊天记录的快照，仅仅保存每次和好友聊天的最后一条消息
	 */
	saveUserChatSnapshot: function(myId, friendId, msg, isRead) {
		var me = this;
		var chatKey = 'chat-snapshot' + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			
			chatSnapshotList = jSON.parse(chatSnapshotListStr);
			
			// 循环快照list，并且判断每个元素是否匹配friendId，如果匹配则删除
			for (var i = 0; i < chatSnapshotList.length; i ++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId所对应的快照对象
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} else {
			chatSnapshotList = [];
		}
		
		var singleMsg = new me.ChatSnapshot(myId, friendId, msg, isRead);
		// 在list头部插入对象，保证最新聊天信息渲染时在顶部
		chatSnapshotList.unshift(singleMsg);
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},
	
	/**
	 * 获取用户快照列表
	 */
	getUserChatSnapshot: function(myId) {
		var me = this;
		var chatKey = 'chat-snapshot' + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			chatSnapshotList = JSON.parse(chatSnapshotListStr);
		} else {
			chatSnapshotList = [];
		}
		
		return chatSnapshotList;
	},
	
	/**
	 * 删除本地快照
	 */
	deleteUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = 'chat-snapshot' + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			
			chatSnapshotList = jSON.parse(chatSnapshotListStr);
			
			// 循环快照list，并且判断每个元素是否匹配friendId，如果匹配则删除
			for (var i = 0; i < chatSnapshotList.length; i ++) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已经存在的friendId所对应的快照对象
					chatSnapshotList.splice(i, 1);
					break;
				}
			}
		} else {
			return;
		}
		
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
	},
	
	/**
	 * 标记未读消息为已读状态
	 */
	readUserChatSnapshot: function(myId, friendId) {
		var me = this;
		var chatKey = 'chat-snapshot' + myId;
		
		// 从本地缓存获取聊天快照的list
		var chatSnapshotListStr = plus.storage.getItem(chatKey);
		
		var chatSnapshotList;
		if (me.isNotNull(chatSnapshotListStr)) {
			chatSnapshotList = jSON.parse(chatSnapshotListStr);
			// 循环list，匹配friendId，把匹配到的删掉重新放入一个已读的快照对象
			for (var i = 0; i < chatSnapshotList.length; i ++) {
				var item = chatSnapshotList[i];
				if (item.friendId == friendId) {
					item.isRead = true;	// 标记为已读
					chatSnapshotList.slice(i, 1, item);	// 替换原有快照
					break;
				}
			}
			// 替换原有的快照列表
			plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList));
		} else {
			return;
		}
	},
	
	/**
	 * 后端消息的动作类型枚举
	 */
	CONNECT: 1, 	// 第一次(或重连)初始化连接
    CHAT: 2, 		// 聊天消息
    SIGNED: 3, 		// 消息签收
    KEEPALIVE: 4,  	// 客户端保持心跳
	PULL_FRIEND: 5,	// 重新拉取好友
	
	/**
	 * 后端的聊天模型对象
	 */
	ChatMsg: function(senderId, receiverId, msg, msgId) {
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.msg = msg;
		this.msgId = msgId;
	},
	
	/**
	 * 后端的消息模型对象
	 */
	DataContent: function(action, chatMsg, extend) {
		this.action = action;
		this.ChatMsg = chatMsg;
		this.extend = extend;
	},
	
	/**
	 * 单个聊天对象构造函数
	 */
	ChatHistory: function(myId, friendId, msg, flag) {
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.flag = flag;
	},
	
	/**
	 * 快照对象
	 * @param {Object} isRead 判断是否已读
	 */
	ChatSnapshot: function(myId, friendId, msg, isRead) {
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.isRead = isRead;
	}
}