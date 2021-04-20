<template>
    <div class="example">{{msg}}</div>
</template>

<script>
    module.exports = {
        data: function() {
            return {
                msg: 'Hello world!'
            }
        }
    }
</script>

<style>
    .example {
        color: red;
    }
</style