# Ohen
> Ohen makes objects observable using dirty checking.

# Installation
```bash
$ npm install osom --save
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
