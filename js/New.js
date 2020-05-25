let vmLog = new Vue({
    el: '#ui',
    data: {
        messages: [],
        showMessages: true,
        users: null,
        onlineCount: 0,
        onlineUsers: [],
        model: null,
        showOnlineUsers: true,
        followUser: null,
        followInterval: null,
    },
    watch: {
        messages() {
            this.$nextTick(() => {
                let container = this.$refs.messages;
                let scrollTop = container.scrollTop;
                let scrollHeight = container.scrollHeight;
                let clientHeight = container.clientHeight;
                if (clientHeight - scrollTop <= 220) {
                    container.scrollTop = scrollHeight
                }
                container.scrollTop = scrollHeight
            })
        },
        followUser(newUser, oldUser) {
            if (this.followInterval !== null) clearInterval(this.followInterval);
            if (newUser !== null) {
                this.followUser = newUser;
                this.followInterval = setInterval(() => {
                    // console.log(this.followUser)
                    this.deliveryTo(this.followUser.user.x, this.followUser.user.y);
                }, 500);
                // console.log(this.followInterval)
            }
        },
        onlineUsers(newOnlineUsers, oldOnlineUsers) {
            if (this.followUser !== null) {
                let index = newOnlineUsers.findIndex((user) => {
                    return this.followUser.id === user.id;
                });
                // console.log('update onlineUsers')
                if (index === -1) {
                    console.log("用户离开，跟随结束")
                    clearInterval(this.followInterval);
                    this.followUser = null;
                    this.followInterval = null;
                }
            }
        }
    },
    computed: {
        showText() {
            return this.showMessages ? '隐藏' : '显示';
        },
        showOnlineUsersText() {
            return this.showOnlineUsers ? '隐藏' : '显示';
        }
    },
    methods: {
        addLog(user, message) {
            this.messages.push({
                user: user,
                message: message,
                type: 'message'
            });
        },
        toggleMessages() {
            this.showMessages = !this.showMessages;
        },
        toggleOnlineUsers() {
            this.showOnlineUsers = !this.showOnlineUsers;
        },
        deliveryTo(x, y) {
            // console.log(x, y, app)
            app.deliveryTo(x, y);
        },
        toUserPos(user) {
            this.deliveryTo(user.x, user.y);
        },
        updateUsers(users) {
            this.users = users;
            this.onlineCount = this.users ? Object.keys(this.users).length : 0;

            //在线用户列表
            let userList = []
            for (let id in this.users) {
                userList.push({
                    id: id,
                    name: this.users[id].name,
                    user: this.users[id]
                })
            }
            this.onlineUsers = userList
        },
        updateModel(model) {
            this.model = model;
        },
        onClickFollowUser(user) {
            this.followUser = user;
            // console.log(user)
        },
        onClickCancelFollow() {
            this.followUser = null;
            clearInterval(this.followInterval);
        }
    }
});
