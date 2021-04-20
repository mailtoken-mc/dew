<template>
    <div class="example">{{msg}}</div>
</template>

<script>
    module.exports = {
        data: function() {
            return {
                msg: 'Hola vue'
            }
        }
    }
</script>

<style>
    .example {
        color: lightgreen;
    }
</style>