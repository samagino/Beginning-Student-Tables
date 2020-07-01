#lang racket/base

(require racket/runtime-path
	 racket/list
	 net/url
         response-ext web-server/dispatch
	 web-server/servlet-dispatch
	 web-server/servlet/servlet-structs
	 web-server/configuration/responders
	 web-server/private/mime-types
	 web-server/private/util
	 web-server/dispatchers/dispatch
	 (prefix-in lift:      web-server/dispatchers/dispatch-lift)
	 (prefix-in fsmap:     web-server/dispatchers/filesystem-map)
	 (prefix-in sequencer: web-server/dispatchers/dispatch-sequencer)
	 (prefix-in files:     web-server/dispatchers/dispatch-files)
	 racket/port
         web-server/http/response-structs
         web-server/http/request-structs)

(define-runtime-path log-dir "logs")
(define-runtime-path htdocs-dir "htdocs")

(define (response/404)
  (response/output #:code 404 (lambda (o) (display "Bad path." o))))


(define (response/file file #:headers [headers '()] [mime TEXT/HTML-MIME-TYPE])
  (response/output (λ (op) (let ([ip (open-input-file file)]) (copy-port ip op) (close-input-port ip))) 
		   #:mime-type mime
		   #:headers headers))


(define-values (dispatch u)
  (dispatch-rules
   [("Beginning-Student-Tables" "list") #:method "get" list-logs]
   [("Beginning-Student-Tables" "log" (string-arg)) #:method "post" save]
   [("Beginning-Student-Tables" "log" (string-arg)) #:method "get" get]))

(define (save req id)
  (log-error "save ~s" id)
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
  (log-error "get ~s" id)
  (cond [(regexp-match "^[a-zA-Z0-9]+$" id)
         (define f (build-path log-dir id))
	 (if (file-exists? f)
	     (response/file f #"text/plain" 
			    #:headers headers)
	     (response/404))]
        [else
         (response/404)]))
  

(define (url->path u)
  (define up (url-path u))
  (if (empty? up)
      (next-dispatcher)
      (let-values ([(p w/o-base) ((fsmap:make-url->path htdocs-dir) u)])
        (if (or (file-exists? p) (link-exists? p) (directory-exists? p))
            (values p w/o-base)
            (url->path (url-replace-path (lambda _ (reverse (rest (reverse up)))) u))))))
(define (make-dispatcher sema)
  (define mime-types-path
    (collection-file-path (build-path "default-web-root" "mime.types")
			  "web-server"))
  (define not-found-path
    (collection-file-path (build-path "default-web-root" "conf" "not-found.html")
			  "web-server"))
  (sequencer:make
   (dispatch/servlet dispatch
         	     #:current-directory htdocs-dir)
   (files:make #:url->path url->path
               #:path->mime-type (make-path->mime-type mime-types-path))
   (lift:make (compose any->response (gen-file-not-found-responder not-found-path)))))
(serve/launch/wait make-dispatcher
		   #:banner? #t
		   #:listen-ip #f
		   #:port 35888)
