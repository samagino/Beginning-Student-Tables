-- The Pretty Printer

infixr 5 :<|>
infixr 6 :<>
infixr 6 <>

data DOC = NIL
         | DOC :<> DOC
         | NEST Int DOC
         | TEXT String
         | LINE
         | DOC :<|> DOC

data Doc = Nil
         | String `Text` Doc
         | Int `Line` Doc

nil      = NIL
x <> y   = x :<> y
nest i x = NEST i x
text s   = TEXT s
line     = LINE

group x = flatten x :<|> x

flatten NIL        = NIL
flatten (x :<> y)  = flatten x :<> flatten y
flatten (NEST i x) = NEST i (flatten x)
flatten (TEXT s)   = TEXT s
flatten LINE       = TEXT " "
flatten (x :<|> y) = flatten x

layout Nil          = ""
layout (s `Text` x) = s ++ layout x
layout (i `Line` x) = '\n' : copy i ' ' ++ layout x

copy i x = [ x | _ <- [1..i] ]

best w k x = be w k [(0,x)]

be w k []                = Nil
be w k ((i,NIL):z)       = be w k z
be w k ((i, x :<> y):z)  = be w k ((i,x):(i,y):z)
be w k ((i, NEST j x):z) = be w k ((i+j,x):z)
be w k ((i,TEXT s):z)    = s `Text` be w (k+length s) z
be w k ((i,LINE):z)      = i `Line` be w i z
be w k ((i,x :<|> y):z)  = better w k (be w k ((i,x):z))
                                      (be w k ((i,y):z))

better w k x y = if fits (w-k) x then x else y

fits w x | w < 0    = False
fits w Nil          = True
fits w (s `Text` x) = fits (w - length s) x
fits w (i `Line` x) = True

pretty w x = layout (best w 0 x)

-- Utility Functions

-- here I use :<> where the paper uses <>
-- pretty much the symbol <> causes a reference error
-- because <> is also a function in the library Prelude, which I
-- guess is loaded automatically
-- So I could prefix <> with Main so it knows I'm referring to the
-- one defined in this file, but I don't feel like doing that and also
-- <> and :<> are equivalent, as defined above, so I just use :<>
x <+> y = x :<> text " " :<> y
x </> y = x :<> line :<> y

folddoc f []     = nil
folddoc f [x]    = x
folddoc f (x:xs) = f x (folddoc f xs)

spread = folddoc (<+>)
stack = folddoc (</>)

-- these are utility functions I defined, but the paper did not
level = folddoc (:<>)
-- note that this definition of bracket is distinct from the one in the paper
bracket left doc right = level [text left, doc, text right]

funct = bracket "(" (group (stack [spread [text "define", name], body])) ")"
name = bracket "(" (spread [text "append", text "la", text "lb" ]) ")"
