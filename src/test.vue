<template>
    <div class="example">{{msg}}</div>
</template>

<script>
    module.exports = {
        data: function() {
            return {
                msg: 'Hola mundo'
            }
        }
    }
</script>

<style>
    .example {
        color: green;
    }
</style>