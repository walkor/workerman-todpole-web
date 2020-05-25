let vmLog = new Vue({
    el: '#ui',
    data: {
        messages: [],
        showMessages: true,
        users: null,
        onlineCount: 0,
        onlineUsers:[],
        model: null,
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
    },
    computed: {
        showText() {
            return this.showMessages ? '隐藏' : '显示';
        },
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
            for(var id in this.users){
                userList.push({
                    id:id,
                    name:this.users[id].name,
                    user:this.users[id]
                })
            }
            this.onlineUsers = userList
        },
        updateModel(model) {
            this.model = model;
        },
        speedUp() {
            this.model.userTadpole.maxMomentum += 1;
        },
        speedDown() {
            this.model.userTadpole.maxMomentum -= 1;
        },
    }
});
