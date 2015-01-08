from django.conf.urls import patterns, include, url

from python_278.views import show, origion, translation, plus_vote, minus_vote
import python_3.views as py3
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'translation.views.home', name='home'),
    # url(r'^translation/', include('translation.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^python_278/(.+)/origion/$', origion),
    url(r'^python_278/(.+)/translation/(\d+)/$', translation),
    url(r'^python_278/(.+)/vote/plus/(\d+)/$', plus_vote),
    url(r'^python_278/(.+)/vote/minus/(\d+)/$', minus_vote),
    url(r'^python_278/(.+\.html)$', show),
    
    url(r'^python_341/(.+)/origion/$', py3.origion),
    url(r'^python_341/(.+)/translation/(\d+)/$', py3.translation),
    url(r'^python_341/(.+)/vote/plus/(\d+)/$', py3.plus_vote),
    url(r'^python_341/(.+)/vote/minus/(\d+)/$', py3.minus_vote),
    url(r'^python_341/(.+\.html)$', py3.show),
    
    url(r'^python_278/_static/(?P<path>.*)$', 'django.views.static.serve', {'document_root':'/var/python/python/templates/python_278/_static/'}),
    url(r'^python_278/_images/(?P<path>.*)$', 'django.views.static.serve', {'document_root':'/var/python/python/templates/python_278/_images/'}),
    url(r'^python_278/(.+)/_static/(?P<path>.*)$', 'django.views.static.serve', {'document_root':'/var/python/python/templates/python_278/_static/'}),
)
