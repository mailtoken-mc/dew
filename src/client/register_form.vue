<style>

</style>
<template lang="pug">
input(type="hidden", name="token", :value="form.token")
div
    label(for="user") Usuario:
    input#user(type="text", name="user", v-model="form.user")
div
    label(for="pass") Contraseña:
    input#pass(type="text", name="pass", v-model="form.pass")
div
    label(for="pass2") Confirmar contraseña:
    input#pass2(type="text", name="pass2", v-model="passConfirm")
div
    label(for="skin") Skin:
    input#skin(type="file", name="skin", v-on:change="checkSkin")
div
    label(for="org") Organización:
    select#org(name="org", v-model="form.org")
        option(value=-1) No establecer
        option(v-for="(org, i) in orgs", :value="i") {{org}}
div
    label(for="year") Año:
    select#year(name="year", v-model="form.year")
        option(value=-1) No establecer
        option(v-for="year in years") {{year}}
div
    br
    button(@click = "sendForm()",  type = "button") Registrar
</template>
<script>
    const cur_year = new Date().getFullYear()
    const axios = require("axios")
    const RegisterShared = require("../shared/register")
    export default {
        props: {
            token: String,
            orgs: Array
        },
        data: function() {
            return {
                years: Array(10).fill().map((e, i) => cur_year - i),
                passConfirm: "",
                form: {
                    token: this.token,
                    user: "",
                    pass: "",
                    skin: false,
                    org: -1,
                    year: -1,
                }
            }
        },
        methods: {
            checkInput() {
                try {
                    RegisterShared.checkInput(this.form)
                } catch (e) {
                    this.displayError(e)
                }
            },
            checkSkin(event) {
                this.form.skin = event.target.files[0]
            },
            displayError(e) {
                console.error(e)
            },
            sendForm() {
                const form = new FormData()
                for (let key in this.form) {
                    form.append(key, this.form[key])
                }
                axios.post("/register", form, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then(this.onResponse)
            },
            onResponse(response) {
                console.log(response.data)
            },
            displayServerError(e) {
                console.error(e)
            }
        }
    }
</script>