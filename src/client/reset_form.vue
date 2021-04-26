<template lang="pug">
input(type="hidden", name="hash", :value="form.hash")
div
    label(for="user") Usuario:
    input#user(type="text", name="user", v-model="form.user")
div
    label(for="pass") Nueva contraseña:
    input#pass(type="text", name="pass", v-model="form.pass")
div
    label(for="pass2") Confirmar contraseña:
    input#pass2(type="text", name="pass2", v-model="passConfirm")
div
    br
    button(@click = "sendForm()",  type = "button") Reestablecer contraseña
</template>
<script>
    const axios = require("axios")
    export default {
        props: {
            hash: String
        },
        data: function () {
            return {
                passConfirm: "",
                form: {
                    hash: this.hash,
                    user: "",
                    pass: ""
                }
            }
        },
        methods: {
            sendForm() {
                const form = new FormData()
                for (let key in this.form) {
                    form.append(key, this.form[key])
                }
                axios.post("/reset", form, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then(this.onResponse)
            },
            onResponse(response) {
                console.log(response.data)
            },
        }
    }
</script>