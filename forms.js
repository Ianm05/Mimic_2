const SUPABASE_URL = 'https://nauwsuspvyhoitkgihha.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VGc-KRH3P6MLExq_3aT4pw_VpKRSLPO';


document.querySelectorAll('form[data-table]').forEach((form) => {
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.textContent;


     const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  button.insertAdjacentElement('afterend', status);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    if (data.get('gotcha')) return;

    const row = {};
    for (const [key, value] of data.entries()) {
        if (key.startsWith('_')) continue;
        const text = String(value).trim();
        row[key] = text === ''? null :text;  
    }
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';
    status.classList.remove('is-error', 'is-success');

    try {
      // 1. Save to the database (the permanent archive)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${form.dataset.table}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(row)
      });
      if (!res.ok) throw new Error('Database error ${res.status}: ${await res.text()}');

      const action =  form.getAttribute || '';
      if(action.includes('formspree.io') && !action.includes('YOUR_FORM_ID')) {
        fetch(action, { method: 'POST', body: data, headers: { Accept: 'application/json '} })
        .catch((err) => console.warn('Formspree email failed:', err ));
      }


      form.reset();
      status.textContent = 'Thank you! We recieved your information and will contact you within 24 hours.';
      status.classList.add('is-success');
    } catch (err) {
        console.error(err);
        const phone = document.querySelector('.phone')?.textContent.trim();
        status.textContent = 'sorry, something went wrong and your message was not sent.'
        + (phone ? ` Please try again or call us at  ${phone}.` : 'Please try again.');
        status.classList.add('is-error');
    } finally {
        button.disabled = false;
        button.textContent = buttonText;
    }
    });

});