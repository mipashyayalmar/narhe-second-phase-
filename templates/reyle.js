(function(document, $) {
    "use strict";

    $.extend(true, $.fancybox.defaults, {
        btnTpl: {
            share: '<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.55 19c1.4-8.4 9.1-9.8 11.9-9.8V5l7 7-7 6.3v-3.5c-2.8 0-10.5 2.1-11.9 4.2z"/></svg></button>'
        },
        share: {
            url: function(instance, item) {
                // Use the exact post URL if available, otherwise fallback to item or window location
                return (
                    item.opts.postUrl ||
                    (!instance.currentHash && item.type !== "inline" && item.type !== "html" && (item.origSrc || item.src)) ||
                    window.location.href
                );
            },
            tpl:
                '<div class="fancybox-share">' +
                '<h1>{{SHARE}}</h1>' +
                '<p>' +
                '<a class="fancybox-share__button fancybox-share__button--wa" href="https://api.whatsapp.com/send?text={{url}}" style="background-color: #25D366;">' +
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.669-.916-.983-.248-.314-.347-.669-.247-.767.099-.099.445-.347.892-.694a3.36 3.36 0 0 1 .644-.223c.223-.074.471-.024.694.099.223.124.471.396.694.694.223.297.297.644.223.966-.074.322-.173.644-.347.892-.173.248-.396.471-.669.644l-.496.495c-.074.074-.148.099-.223.099zm4.702-2.06A12.015 12.015 0 0 0 12.06 0a11.964 11.964 0 0 0-9.937 5.382 12.015 12.015 0 0 0 .297 13.06L0 24l5.937-1.558a12.015 12.015 0 0 0 6.124 1.66h.005c6.627 0 12-5.373 12-12a11.964 11.964 0 0 0-1.755-6.162zM12.06 21.937a9.955 9.955 0 0 1-5.06-1.387l-.362-.173-3.522.925.94-3.437-.173-.362a9.955 9.955 0 0 1-1.512-5.318c0-5.53 4.493-10.022 10.022-10.022 2.67 0 5.184 1.04 7.072 2.928a9.955 9.955 0 0 1 2.928 7.072c0 5.53-4.493 10.022-10.022 10.022z"/></svg>' +
                '<span>WhatsApp</span></a>' +
                '<a class="fancybox-share__button fancybox-share__button--in" href="https://www.instagram.com/?url={{url}}" style="background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);">' +
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63a6.932 6.932 0 0 0-2.51 1.636A6.932 6.932 0 0 0 .63 4.14C.333 4.905.132 5.775.072 7.053.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a6.932 6.932 0 0 0 1.636 2.51 6.932 6.932 0 0 0 2.51 1.636c.765.297 1.636.498 2.913.558C8.333 23.985 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.261 2.913-.558a6.932 6.932 0 0 0 2.51-1.636 6.932 6.932 0 0 0 1.636-2.51c.297-.765.498-1.636.558-2.913.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913a6.932 6.932 0 0 0-1.636-2.51A6.932 6.932 0 0 0 19.86.63c-.765-.297-1.636-.498-2.913-.558C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.899.422.422.682.82.899 1.382.166.422.36 1.057.415 2.227.055 1.265.07 1.647.07 4.85s-.015 3.585-.07 4.85c-.055 1.17-.249 1.805-.415 2.227a3.827 3.827 0 0 1-.899 1.382c-.422.422-.82.682-1.382.899-.422.166-1.057.36-2.227.415-1.265.055-1.647.07-4.85.07s-3.585-.015-4.85-.07c-1.17-.055-1.805-.249-2.227-.415a3.827 3.827 0 0 1-1.382-.899c-.422-.422-.682-.82-.899-1.382-.166-.422-.36-1.057-.415-2.227-.055-1.265-.07-1.647-.07-4.85s.015-3.585.07-4.85c.055-1.17.249-1.805.415-2.227a3.827 3.827 0 0 1 .899-1.382c.422-.422.82-.682 1.382-.899.422-.166 1.057-.36 2.227-.415 1.265-.055 1.647-.07 4.85-.07zm0 3.264a6.576 6.576 0 1 0 0 13.152 6.576 6.576 0 0 0 0-13.152zm0 10.848a4.272 4.272 0 1 1 0-8.544 4.272 4.272 0 0 1 0 8.544zm6.816-11.232a1.536 1.536 0 1 1-3.072 0 1.536 1.536 0 0 1 3.072 0z"/></svg>' +
                '<span>Instagram</span></a>' +
                '<a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}" style="background-color: #1877F2;">' +
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854V15.27H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.27h-2.796v8.584C19.612 22.954 24 17.99 24 12.073z"/></svg>' +
                '<span>Facebook</span></a>' +
                '<a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}" style="background-color: #1DA1F2;">' +
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M23.953 4.57a9.992 9.992 0 0 1-2.825 3.094 4.996 4.996 0 0 0-.337-3.586 4.99 4.99 0 0 0-3.586-.337c.9-.558 1.693-1.314 2.25-2.25a9.948 9.948 0 0 1-3.176 1.215A5.001 5.001 0 0 0 8.96 7.616a14.146 14.146 0 0 1-10.28-5.216 5.002 5.002 0 0 0 1.55 6.674 4.983 4.983 0 0 1-2.265-.627v.063a5.002 5.002 0 0 0 4.01 4.9 4.99 4.99 0 0 1-2.25.085 5.002 5.002 0 0 0 4.672 3.47 10.01 10.01 0 0 1-6.19 2.135c-.402 0-.8-.024-1.19-.072a14.14 14.14 0 0 0 7.672 2.25c9.215 0 14.25-7.633 14.25-14.25 0-.216-.005-.432-.015-.647A10.15 10.15 0 0 0 24 4.57z"/></svg>' +
                '<span>Twitter</span></a>' +
                '<a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}" style="background-color: #E60023;">' +
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M12 0a12 12 0 0 0-3.797 23.377c-.06-.55-.103-1.398.022-2.004l1.354-5.74a3.75 3.75 0 0 1-.322-1.674c0-1.566.835-2.896 1.876-2.896 1.392 0 2.456 1.105 2.456 2.573 0 1.566-.797 2.896-1.835 2.896-.406 0-.797-.276-1.354-.797-.797 1.105-1.955 2.573-1.955 4.138 0 .957.276 1.835.276 1.835l-.022.022c-.022.135-.022.276-.022.418 0 1.392 1.876 2.573 4.138 2.573 2.896 0 5.13-2.573 5.13-5.74 0-3.167-2.573-5.74-5.74-5.74-2.573 0-4.138 1.835-4.138 3.956 0 .957.322 1.674.797 2.231.135.203.203.406.135.61-.203.61-.61 1.876-.797 2.573-.135.406-.406.797-.797.957-.957.406-1.955.135-2.573-.61-.61-.61-.957-1.392-.957-2.231 0-2.573 1.835-4.904 5.304-4.904 2.784 0 4.904 2.231 4.904 5.13 0 2.784-1.955 5.13-4.672 5.13-1.566 0-2.784-.797-3.243-1.674l-.797 3.243c-.276 1.105-1.105 2.231-1.955 2.896A12 12 0 0 0 24 12 12 12 0 0 0 12 0z"/></svg>' +
                '<span>Pinterest</span></a>' +
                '</p>' +
                '<p><input class="fancybox-share__input" type="text" value="{{url_raw}}" onclick="select()" /></p>' +
                '</div>'
        }
    });

    $(document).on('click', '[data-fancybox-share]', function() {
        var instance = $.fancybox.getInstance(),
            current = instance.current || null,
            url, tpl;

        if (!current) return;

        // Allow custom post URL to be set via data attribute
        var postUrl = current.$content ? current.$content.closest('.fancybox-slide').data('post-url') : null;
        if (postUrl) {
            current.opts.postUrl = postUrl;
        }

        if ($.type(current.opts.share.url) === "function") {
            url = current.opts.share.url.apply(current, [instance, current]);
        }

        tpl = current.opts.share.tpl
            .replace(/\{\{url\}\}/g, encodeURIComponent(url))
            .replace(/\{\{url_raw\}\}/g, function(url) {
                var escaped = {
                    "&": "&",
                    "<": "<",
                    ">": ">",
                    '"': """,
                    "'": "'",
                    "/": "/",
                    "`": "`",
                    "=": "="
                };
                return String(url).replace(/[&<>"'`=\/]/g, function(s) {
                    return escaped[s];
                });
            }(url))
            .replace(/\{\{descr\}\}/g, "");

        $.fancybox.open({
            src: instance.translate(instance, tpl),
            type: "html",
            opts: {
                touch: false,
                animationEffect: false,
                afterLoad: function(shareInstance, shareCurrent) {
                    instance.$refs.container.one('beforeClose.fb', function() {
                        shareInstance.close(null, 0);
                    });

                    shareCurrent.$content.find('.fancybox-share__button').click(function() {
                        window.open(this.href, 'Share', 'width=550, height=450');
                        return false;
                    });
                },
                mobile: {
                    autoFocus: false
                }
            }
        });
    });

})(document, jQuery);