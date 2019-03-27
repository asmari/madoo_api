module.exports = { 
    "extends": "airbnb-base",
    "parser":"babel-eslint",
    "parserOptions":{
        "ecmaVersion":2017,
        "experimentalObjectRestSpread":{
            "spread":true
        }
    },
    "rules":{
        "indent": ["error", "tab"],
        "no-tabs": 0
    }
};