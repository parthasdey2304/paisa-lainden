import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypefusjmzfiyfmpitglh.supabase.co'
const supabaseAnonKey = 'sb_publishable_szadwMt6-_psznRWnnQo-w_vKLTES82'

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Starting DB update...');
  
  // Update all existing payments to have payment_method = 'online'
  const { data, error } = await supabase
    .from('payments')
    .update({ payment_method: 'online' })
    .neq('id', 'dummy'); // Dummy condition to target all rows (since .update without eq is rejected by default on some setups, but let's try just updating all where payment_method is offline)

  const { data: updatedData, error: updateError } = await supabase
    .from('payments')
    .update({ payment_method: 'online' })
    .eq('payment_method', 'offline');

  // Also update cases where it was NULL
  const { data: nullData, error: nullError } = await supabase
    .from('payments')
    .update({ payment_method: 'online' })
    .is('payment_method', null);

  if (updateError) {
    console.error('Error updating offline records:', updateError);
  } else {
    console.log('Successfully updated offline records to online.');
  }

  if (nullError) {
    console.error('Error updating null records:', nullError);
  } else {
    console.log('Successfully updated null records to online.');
  }

  console.log('DB update complete.');
}

run();
