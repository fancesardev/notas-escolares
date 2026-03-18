import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**2.** Guardá el archivo y en la terminal ejecutá:
```
git add .
git commit -m "usar variables de entorno para supabase"
git push