var app = new Vue({
    el: '#app',
    data: {
        postResult: '',
        nextPost: '',
        showPostNowStatus: false,
        showSpinner: false,
        showError: false
    },
    methods: {
        postNow() {
           this.showSpinner = true;
            axios.get('/api/post-now').then(res => {
               if(res.status === 200)  {
                  this.showSpinner = false;
                  this.showPostNowStatus = true;
                  this.nextPost = this.postResult = res.data;
                  setTimeout(function () { this.showPostNowStatus = false; }.bind(this), 8000);
               } else {
                  this.showSpinner = false;
                  this.showError = true;
                  setTimeout(function () { this.showError = false; }.bind(this), 8000);
               }
            });
        },

        getNextPost() {
            axios.get('/api/next-post').then(res => {
                if(res.status === 200) this.nextPost = res.data;
                else {
                  this.showError = true;
                  setTimeout(function () { this.showError = false; }.bind(this), 8000);
               }
            });
        }
    },
    mounted: function() {
        this.getNextPost();
    },
    filters: {
        moment: function(date) {
            return moment(date).format('MMMM Do YYYY - HH:mm:ss');
        }
    }
})
