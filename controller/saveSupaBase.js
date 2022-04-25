require('dotenv').config();

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://hvyekjgncojkrdnhqvvx.supabase.co'
const supabaseKey = process.env.API_KEY

const supabase = createClient( supabaseUrl ,supabaseKey  ) 

const saveSupa = async(data) =>{

    const insert = await supabase.from('laptos')
    .insert( data )

    Promise.resolve(insert)

}

module.exports = saveSupa;