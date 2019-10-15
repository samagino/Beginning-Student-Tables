#lang racket/base

(require racket/runtime-path web-server/servlet-env
         response-ext web-server/dispatch
	 racket/port
         web-server/http/response-structs
         web-server/http/request-structs)

(define-runtime-path log-dir "logs")

(define (response/404)
  (response/output #:code 404 (lambda (o) (write "Bad path." o))))


(define (response/file file #:headers [headers '()] [mime TEXT/HTML-MIME-TYPE])
  (response/output (λ (op) (let ([ip (open-input-file file)]) (copy-port ip op) (close-input-port ip))) 
		   #:mime-type mime
		   #:headers headers))


(define-values (dispatch u)
  (dispatch-rules
   [("list") #:method "get" list-logs]
   [("log" (string-arg)) #:method "post" save]
   [("log" (string-arg)) #:method "get" get]))

(define (save req id)
  (cond [(regexp-match "^[a-zA-Z0-9]+$" id)
         (define data (request-post-data/raw req))
         (when data
           (call-with-output-file (build-path log-dir id)
	     #:exists 'truncate
             (lambda (o)
               (write-bytes data o))))
         (response/make "it worked!")]
        [(response/404)]))

(define headers
  (list (make-header #"Access-Control-Allow-Origin" #"*")
        #;(make-header #"Cache-Control" #"no-cache")))

(define (list-logs req)
  (define l (directory-list log-dir))
  (response/json 
   (for/hash ([p (in-list l)])
	     (values
	      (string->symbol (path->string p))
	      (hash 
	       'size (file-size (build-path log-dir p))
	       'time (file-or-directory-modify-seconds (build-path log-dir p)))))
   #:headers headers))

(define (get req id)
  (log-error "id is: ~s" id)
  (cond [(regexp-match "^[a-zA-Z0-9]+$" id)
         (define f (build-path log-dir id))
	 (if (file-exists? f)
	     (response/file f #"text/plain" 
			    #:headers headers)
	     (response/404))]
        [else
         (response/404)]))
  

(serve/servlet dispatch
	       #:servlet-path "/"
	       #:servlet-regexp #rx""
	       #:listen-ip #f)
