"use strict";

/*! lightbox.js | Friendkit | © Css Ninja. 2019-2020 */
$(function() {
    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Function to format time since post (mimics Django's timesince)
    function formatTimeSince(date) {
        const now = new Date();
        const commentDate = new Date(date);
        const diff = Math.floor((now - commentDate) / 1000 / 60); // Minutes
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ago`;
    }

    // Function to generate comment HTML (mimics comment.html)
    function generateCommentHtml(comment, postId, isNested = false) {
        const profileImage = comment.user.profile_image ?
            `<div class="image"><img src="${comment.user.profile_image}" alt=""></div>` :
            '';
        const username = comment.user.username || 'Unknown User';
        const time = formatTimeSince(comment.date);
        const body = comment.body || '';
        const nestedClass = isNested ? 'is-nested' : '';

        let html = `
            <div class="media is-comment ${nestedClass}" id="comment-${comment.id}">
                <div class="media-left">
                    ${profileImage}
                </div>
                <div class="media-content">
                    <a href="#">${username}</a>
                    <span class="time">${time}</span>
                    <p>${body}</p>
                    <div class="controls">
                        <div class="like-count">
                            <i data-feather="thumbs-up"></i>
                            <span>0</span>
                        </div>
                        <div class="reply">
                            <a onclick="setReply('${postId}', '${comment.id}', '${username}')">Reply</a>
                        </div>
                    </div>
        `;

        // Add replies recursively
        if (comment.children && comment.children.length) {
            comment.children.forEach(reply => {
                html += generateCommentHtml(reply, postId, true);
            });
        }

        html += `</div></div>`;
        return html;
    }

    // Fetch comments via API
    function fetchComments(postId, callback) {
        if (!uuidRegex.test(postId)) {
            console.error(`Invalid UUID format for postId: ${postId}`);
            callback('<p>Error: Invalid post ID format. Please ensure post IDs are UUIDs.</p>');
            return;
        }

        console.log(`Fetching comments for post-${postId}`);
        $.ajax({
            url: `/api/posts/${postId}/comments/`,
            method: 'GET',
            success: function(data) {
                console.log(`Comments fetched for post-${postId}:`, data);
                let commentsHtml = '';
                data.forEach(comment => {
                    commentsHtml += generateCommentHtml(comment, postId);
                });
                callback(commentsHtml ||  `<div class="comments-placeholder">
                <img src="/static/assets/img/icons/feed/bubble.svg" alt="" />
                <div>
                    <h3>Nothing in here yet</h3>
                    <p>Be the first to post a comment.</p>
                </div>
            </div>`);
            },
            error: function(xhr) {
                console.error(`Failed to fetch comments for post-${postId}:`, xhr.status, xhr.responseText);
                let errorMsg = 'Error loading comments';
                if (xhr.status === 404) {
                    errorMsg = 'Error: Post not found';
                } else if (xhr.status === 500) {
                    errorMsg = `Server error: ${xhr.responseText}`;
                }
                callback(`<p>${errorMsg}</p>`);
            }
        });
    }

    if ($("[data-fancybox]").length) {
        const n = feather.icons["more-vertical"].toSvg(),
              s = feather.icons["thumbs-up"].toSvg(),
              a = feather.icons.lock.toSvg(),
              i = feather.icons.user.toSvg(),
              e = feather.icons.users.toSvg(),
              d = feather.icons.globe.toSvg(),
              t = feather.icons.heart.toSvg(),
              c = feather.icons.smile.toSvg(),
              o = feather.icons["message-circle"].toSvg();
        const csrfToken = $('meta[name="csrf-token"]').attr('content') || '';

        $("[data-fancybox]").each(function() {
            if ("comments" == $(this).attr("data-lightbox-type")) {
                const fancyboxId = $(this).attr("data-fancybox");
                console.log(`Raw data-fancybox value: ${fancyboxId}`);
                const postId = fancyboxId.replace('post', '');
                console.log(`Opening lightbox for post-${postId}`);

                // Extract post data from DOM
                const $post = $(`#feed-post-${postId}`);
                if (!$post.length) {
                    console.warn(`Post #feed-post-${postId} not found in DOM`);
                }
                const headerImage = $post.find('.user-block .image img').attr('src') || '{% static "assets/img/avatars/placeholder.jpg" %}';
                const username = $post.find('.user-info a').text() || 'Unknown User';
                const time = $post.find('.user-info .time').text() || 'Unknown time';
                const likesCount = $post.find('.likes-count span').text() || '0';
                const commentsCount = $post.find('.comments-count span').text() || '0';
                const currentUserImage = $post.find('.post-comment .image img').attr('src') || '{% static "assets/img/avatars/placeholder.jpg" %}';

                // Fetch comments dynamically
                fetchComments(postId, function(commentsHtml) {
                    const lightboxHtml = `
                        <div class="header">
                            <img src="${headerImage}" alt="">
                            <div class="user-meta">
                                <span>${username}</span>
                                <span><small>${time}</small></span>
                            </div>
                            <button type="button" class="button">Follow</button>
                            <div class="dropdown is-spaced is-right dropdown-trigger">
                                <div>
                                    <div class="button">
                                        ${n}
                                    </div>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div class="dropdown-content">
                                        <div class="dropdown-item is-title has-text-left">
                                            Who can see this ?
                                        </div>
                                        <a href="#" class="dropdown-item">
                                            <div class="media">
                                                ${d}
                                                <div class="media-content">
                                                    <h3>Public</h3>
                                                    <small>Anyone can see this publication.</small>
                                                </div>
                                            </div>
                                        </a>
                                        <a class="dropdown-item">
                                            <div class="media">
                                                ${e}
                                                <div class="media-content">
                                                    <h3>Friends</h3>
                                                    <small>Only friends can see this publication.</small>
                                                </div>
                                            </div>
                                        </a>
                                        <a class="dropdown-item">
                                            <div class="media">
                                                ${i}
                                                <div class="media-content">
                                                    <h3>Specific friends</h3>
                                                    <small>Don't show it to some friends.</small>
                                                </div>
                                            </div>
                                        </a>
                                        <hr class="dropdown-divider">
                                        <a class="dropdown-item">
                                            <div class="media">
                                                ${a}
                                                <div class="media-content">
                                                    <h3>Only me</h3>
                                                    <small>Only me can see this publication.</small>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="inner-content">
                            <div class="live-stats">
                                <div class="social-count">
                                    <div class="likes-count">
                                        ${t}
                                        <span>${likesCount}</span>
                                    </div>
                                    <div class="comments-count">
                                        ${o}
                                        <span>${commentsCount}</span>
                                    </div>
                                </div>
                                <div class="social-count ml-auto">
                                    <div class="views-count">
                                        <span>${commentsCount}</span>
                                        <span class="views"><small>comments</small></span>
                                    </div>
                                </div>
                            </div>
                            <div class="actions">
                                <div class="action">
                                    ${s}
                                    <span>Like</span>
                                </div>
                                <div class="action">
                                    ${o}
                                    <span>Comment</span>
                                </div>
                            </div>
                        </div>

                        <div class="comments-list has-slimscroll">
                            ${commentsHtml}
                        </div>

                        <div class="comment-controls has-lightbox-emojis">
                            <div class="controls-inner">
                                <form method="POST" action="/" class="media post-comment lightbox-comment-form" data-post-id="${postId}">
                                    <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                                    <input type="hidden" name="post_id" value="${postId}">
                                    <div class="media-content">
                                        <div class="field">
                                            <p class="control">
                                                <img class="is-rounded image is-32x32" src="${currentUserImage}" alt="">
                                            </p>
                                        </div>
                                        <div class="control">
                                            <textarea class="textarea is-rounded" name="body" rows="2" placeholder="Write a comment..." required></textarea>
                                        </div>
                                        <div class="actions">
                                            <div class="action is-emoji">
                                                <button class="emoji-button" type="button">
                                                    ${c}
                                                </button>
                                            </div>
                                            <button type="submit" class="button is-small is-primary">Post Comment</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;

                    $(this).fancybox({
                        baseClass: "fancybox-custom-layout",
                        keyboard: false,
                        infobar: false,
                        touch: {
                            vertical: false
                        },
                        buttons: ["close", "thumbs", "share"],
                        animationEffect: "fade",
                        transitionEffect: "fade",
                        preventCaptionOverlap: false,
                        idleTime: false,
                        gutter: 0,
                        caption: function() {
                            return lightboxHtml;
                        },
                        afterShow: function(instance, slide) {
                            initDropdowns();
                            initLightboxEmojis();
                            feather.replace();

                            // Handle lightbox comment form submission
                            $('.lightbox-comment-form').off('submit').on('submit', function(e) {
                                e.preventDefault();
                                const form = $(this);
                                const postId = form.data('post-id');
                                const formData = new FormData(this);

                                $.ajax({
                                    url: '/',
                                    method: 'POST',
                                    data: formData,
                                    processData: false,
                                    contentType: false,
                                    headers: {
                                        'X-CSRFToken': csrfToken,
                                        'X-Requested-With': 'XMLHttpRequest'
                                    },
                                    success: function(data) {
                                        if (data.success) {
                                            fetchComments(postId, function(commentsHtml) {
                                                form.closest('.fancybox-content').find('.comments-list').html(commentsHtml);
                                                form.find('textarea').val('');
                                                feather.replace();
                                                form.closest('.fancybox-content').find('.comments-count span').text($('.comments-list .is-comment').length);
                                            });
                                        } else {
                                            console.error('Comment submission failed:', data.error);
                                        }
                                    },
                                    error: function(xhr) {
                                        console.error('Error submitting comment:', xhr.status, xhr.responseText);
                                    }
                                });
                            });

                            if ("development" === env) {
                                $(".fancybox-container [data-demo-src]").each(function() {
                                    var src = $(this).attr("data-demo-src");
                                    $(this).attr("src", src);
                                });
                            }
                        }
                    });
                }.bind(this));
            }
        });
    }

    
    // Inject CSS styles
    const lightboxCSS = `

.header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.header img.is-rounded {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
    flex-shrink: 0;
}

.user-meta {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.username {
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.time {
    color: #999;
    font-size: 0.8em;
}

.follow-button {
    margin-left: auto;
    margin-right: 8px;
    white-space: nowrap;
    background: #fff;
    border: 1px solid #4a89dc;
    color: #4a89dc;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.9em;
    cursor: pointer;
}

.follow-button:hover {
    background: #4a89dc;
    color: #fff;
}

.dropdown {
    position: relative;
}

.dropdown-trigger .button.is-icon {
    background: none;
    border: none;
    padding: 4px;
}

.dropdown-menu {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    min-width: 200px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.dropdown-menu.is-active {
    display: block;
}

.dropdown-content {
    padding: 8px 0;
}

.dropdown-item {
    padding: 8px 16px;
    display: block;
    color: #333;
    text-align: left;
    white-space: nowrap;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.dropdown-item.is-title {
    font-weight: 600;
    padding-bottom: 4px;
}

.dropdown-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 4px 0;
}

.inner-content {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.live-stats {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.social-count {
    display: flex;
    align-items: center;
}

.social-count.ml-auto {
    margin-left: auto;
}

.likes-count,
.comments-count {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

.likes-count svg,
.comments-count svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    color: #999;
}

.views-count {
    display: flex;
    align-items: center;
}

.views-count .views {
    margin-left: 4px;
    color: #999;
    font-size: 0.8em;
}

.actions {
    display: flex;
    padding: 8px 0;
}

.action {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 8px;
    cursor: pointer;
    color: #666;
    background: none;
    border: none;
    font-size: 0.9em;
}

.action:hover {
    background: #f5f5f5;
    border-radius: 4px;
}

.action svg {
    width: 18px;
    height: 18px;
    margin-right: 6px;
}

.comments-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
}

.media.is-comment {
    margin-bottom: 16px;
    position: relative;
}

.media.is-comment.is-nested {
    margin-left: 32px;
    margin-top: 16px;
}

.media-left {
    margin-right: 12px;
}

.media-left .image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
}

.media-left img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.comment-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 4px;
}

.comment-header .username {
    font-weight: 600;
    margin-right: 8px;
}

.comment-header .time {
    font-size: 0.8em;
}

.comment-body {
    margin-bottom: 8px;
    line-height: 1.4;
    word-break: break-word;
}

.comment-actions {
    display: flex;
    align-items: center;
    font-size: 0.8em;
    color: #666;
}

.comment-actions button {
    background: none;
    border: none;
    padding: 4px 8px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #666;
}

.comment-actions button:hover {
    background: #f5f5f5;
    border-radius: 4px;
}

.comment-actions button svg {
    width: 14px;
    height: 14px;
    margin-right: 4px;
}

.like-button.is-active svg {
    color: #ff3860;
    fill: #ff3860;
}

.comment-replies {
    margin-top: 12px;
    border-left: 2px solid #f0f0f0;
    padding-left: 12px;
}

.reply-form-container {
    margin-top: 8px;
    margin-bottom: 16px;
}

.reply-form .textarea {
    min-height: 36px;
    font-size: 0.9em;
}

.comment-controls {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.controls-inner {
    display: flex;
    align-items: center;
}

.controls-inner img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
    flex-shrink: 0;
}

.comment-form {
    flex-grow: 1;
    position: relative;
}

.comment-form .control {
    position: relative;
}

.comment-form .textarea {
    width: 100%;
    min-height: 40px;
    padding: 10px 40px 10px 12px;
    border-radius: 20px;
    border: 1px solid #ddd;
    resize: none;
    transition: all 0.3s;
    font-size: 0.9em;
}

.comment-form .textarea:focus {
    border-color: #4a89dc;
    box-shadow: 0 0 0 2px rgba(74, 137, 220, 0.2);
}

.emoji-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
}

.emoji-button svg {
    width: 18px;
    height: 18px;
    color: #999;
}

.comment-form button[type="submit"] {
    margin-left: 8px;
}


.has-slimscroll::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.notification {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
}

.notification.is-warning {
    background: #ffdd57;
    color: #333;
}

.notification.is-danger {
    background: #ff3860;
    color: #fff;
}
`;

    // Inject CSS
    $('<style>').text(lightboxCSS).appendTo('head');
});