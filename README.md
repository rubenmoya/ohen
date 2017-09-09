# Ohen
> Ohen makes objects observable using dirty checking.

![Last version](https://img.shields.io/github/tag/rubenmoya/ohen.svg?style=flat-square)
[![Build Status](https://travis-ci.org/rubenmoya/ohen.svg?branch=master)](https://travis-ci.org/rubenmoya/ohen)
[![Greenkeeper badge](https://badges.greenkeeper.io/rubenmoya/ohen.svg)](https://greenkeeper.io/)
[![Dev Dependencies Status](https://img.shields.io/david/dev/rubenmoya/ohen.svg?style=flat-square)](https://david-dm.org/rubenmoya/ohen#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/ohen.svg?style=flat-square)](https://www.npmjs.org/package/ohen)

# Installation
```bash
$ npm install ohen --save
```

## Preview

```javascript
import Ohen from 'ohen';

const person = {
  name: 'Eragon',
  dragon: 'Saphira',
};

Ohen.observe(person, changes => {
  console.log(`@person: ${changes}`));
}, ['add', 'update', 'delete']);

person.father = 'Brom';
// @person: { "name": "name", "type": "update", "object": Object, "oldValue": "Eragon" }

person.name = 'Argetlam';
// @person: { "name": "father", "type": "add", "object": Object }

delete person.father;
// @person: { "name": "father", "type": "delete", "object": Object, "oldValue": "Brom" }
```

## License

MIT © [Rubén Moya](https://github.com/rubenmoya)
