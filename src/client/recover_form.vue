<template lang="pug">
div
    label(for="mail") Mail:
    input#mail(type="text", name="mail" v-model="form.mail")
div
    label(for="user") Usuario:
    input#user(type="text", name="user", v-model="form.user")
div
    br
    button(@click = "sendForm()", type = "button") Recuperar
</template>
<script>
    const axios = require("axios")
    export default {
        data: function() {
            return {
                form: {
                    mail: "",
                    user: ""
                }
            }
        },
        methods: {
            sendForm() {
                const form = new FormData()
                for (let key in this.form) {
                    form.append(key, this.form[key])
                }
                axios.post("/recover", form, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then(this.onResponse)
            },
            onResponse(response) {
               console.log(response.data)
            }
        }
    }
</script>