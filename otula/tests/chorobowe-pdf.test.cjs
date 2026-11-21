const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Check the contract against the field map of the bundled official four-page form.
const dist = path.join(__dirname, '../dist');
let printed;
const window = {OtulaWniosek: {composePdf: request => { printed = request; }}};
async function fetchLocal(url) {
  const bytes = fs.readFileSync(path.join(dist, url));
  return {ok: true, json: async () => JSON.parse(bytes), arrayBuffer: async () => bytes};
}
vm.runInNewContext(fs.readFileSync(path.join(dist, 'chorobowe-pdf.js'), 'utf8'),
  {window, fetch: fetchLocal, Date});
async function main() {
  await window.OtulaChorobowe.generate({
    Imie:'Łucja', from:'2027-01-05', to:'2027-01-12', timing:'both',
    Data:'2027-01-10', cause:'no', seafarer:'', zla:'ABC'
  });
  const value = name => {
    const field = printed.schema.fields.find(f => f.name === name);
    assert.ok(field, 'Missing field ' + name);
    return printed.values[field.page + '.' + name];
  };
  assert.equal(printed.schema.pages, 4);
  assert.ok(printed.template.subarray(0,5).equals(Buffer.from('%PDF-')));
  assert.equal(value('Imie'), 'Łucja');
  assert.equal(value('Tekst'), '05.01.2027 – 12.01.2027, ABC');
  assert.equal(value('Data'), '10012027');
  assert.equal(value('wniosek1A'), true);
  assert.equal(value('wniosek1B'), true);
  assert.equal(value('TAK_5'), false);
  assert.equal(value('NIE_5'), true);
  assert.equal(value('TAK_6'), false);
  assert.equal(value('NIE_6'), false);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
