#-*- encoding: utf-8 -*-

import urllib
import urllib2
import json
import datetime
import time
import bs4
import re

finhtml = "sys.html"
folder = 'library'
fsql = open('sql.sql', 'wb')
fhtml = open('output.html', 'wb')
access_token = {}
sent_sql = "insert into py276_sentences values ({0}, {1}, '{2}', '{3}', '{4}');\n"
tran_sql = "insert into py276_translations values ({0}, {1}, '{2}', '{3}', 0, 0);\n"
sent_id = 1
tran_id = 1
sid = 1
soup = bs4.BeautifulSoup(open(finhtml))

def get_access_token():
    if access_token:
        now = datetime.datetime.now()
        duration = now - access_token['time']
        if duration.seconds > 500:
            _get_access_token()
    else:
        _get_access_token()
        
def _get_access_token():
    print '_get_access_token'
    parameters = {}
    parameters['client_id'] = 'xxxxxx' # replace xxxxxx with your client_id
    parameters['client_secret'] = 'yyyyyy' # replace yyyyyy with your client_secret
    parameters['scope'] = 'http://api.microsofttranslator.com'
    parameters['grant_type'] = 'client_credentials'
    request_data = urllib.urlencode(parameters)
    try:
        response = urllib2.urlopen('https://datamarket.accesscontrol.windows.net/v2/OAuth2-13', request_data)
        response_code = response.code
        response_body = response.read()
    except urllib2.URLError, ue:
        print ue.reason
    except Exception, e:
        response_code = e.code
        response_body = e.read()
    access_token['value'] = json.loads(response_body)['access_token']
    access_token['time'] = datetime.datetime.now()

def _ms_translation(text):
    get_access_token()
    #options = {'options': r'{"ContentType":"text/html"}'}
    #options = urllib.urlencode(options)
    texts = {'texts': text}
    texts = urllib.urlencode(texts)
    texts = 'texts=[%22' + texts.split('=', 1)[1] + '%22]'
    uri = "http://api.microsofttranslator.com/v2/ajax.svc/TranslateArray?to=zh-CHS&from=en&%s" % (texts)
    request = urllib2.Request(uri)
    request.add_header('Authorization', 'Bearer %s' % access_token['value'])
    attempts = 0
    while attempts < 3:
        try:
            print attempts,
            response = urllib2.urlopen(request)
            response_code = response.code
            response_body = response.read()
            break
        except urllib2.URLError, ue:
            attempts += 1
            print ue.reason
        except Exception, e:
            attempts += 1
            print e
            #response_code = e.code
            response_body = e.read()
    return response_body

def ms_translation(tag):
    global sid
    text = re.sub('\s+', ' ', str(tag))
    text = re.sub('</?%s>' % tag.name, '', text)
    r = _ms_translation(text).lstrip('\xef\xbb\xbf')
    try:
        r = json.loads(r)[0]
        r['OriginalText'] = text.decode('utf-8')
    except Exception, e:
        print sid, e
        #print r
        OriginalText = text.decode('utf-8')
        r = {'OriginalText': OriginalText, 'OriginalTextSentenceLengths': [len(OriginalText)], 
             'TranslatedText': OriginalText, 'TranslatedTextSentenceLengths': [len(OriginalText)]}
    return r

def detach_tag(tag):
    i = 10
    tags = {}
    for d in tag.descendants:
        if isinstance(d, bs4.element.Tag):
            name = 'b%s' % i
            tags[name] = {'name': d.name, 'attrs': d.attrs}
            d.attrs = {}
            d.name = name
            i += 1
    name = 'b%s' % i
    tags[name] = {'name': tag.name, 'attrs': tag.attrs}
    tag.attrs = {}
    tag.name = name
    return tags

def apply_sub_tag(tag, original_tags):
    for d in tag.descendants:
        if isinstance(d, bs4.element.Tag):
            if original_tags.has_key(d.name):
                o_tag = original_tags[d.name]
                d.name = o_tag['name']
                d.attrs = o_tag['attrs']

def apply_tag(tag, original_tags):
    o_tag = original_tags[tag.name]
    tag.name = o_tag['name']
    tag.attrs = o_tag['attrs']

def handle(tag):
    global sent_id
    global tran_id
    global sid
    global sent_sql
    global tran_sql
    global finhtml
    original_tags = detach_tag(tag)
    mt = ms_translation(tag)
    apply_tag(tag, original_tags)
    tag.clear()
    o_start = 0
    t_start = 0
    for o_len, t_len in zip(mt['OriginalTextSentenceLengths'], mt['TranslatedTextSentenceLengths']):
        #seperate original sentences
        o_end = o_start + o_len
        o_sentence = mt['OriginalText'][o_start: o_end]
        o_start = o_end
        o_tag = bs4.BeautifulSoup(o_sentence)
        apply_sub_tag(o_tag, original_tags)
        #seperate translated sentences
        t_end = t_start + t_len
        t_sentence = mt['TranslatedText'][t_start: t_end]
        t_start = t_end
        t_tag = bs4.BeautifulSoup(t_sentence)
        apply_sub_tag(t_tag, original_tags)
        #append sentence font tag
        fsql.write(sent_sql.format(sent_id, sid, '%s/%s'%(folder, finhtml), str(o_tag).replace("'", "\\'"), str(t_tag).replace("'", "\\'")))
        fsql.write(tran_sql.format(tran_id, sid, '%s/%s'%(folder, finhtml), str(t_tag).replace("'", "\\'")))
        f_tag = soup.new_tag('font')
        f_tag['id'] = '%s' % sid
        f_tag.string = '{{s.%s}}' % sid
        #f_tag.append(t_tag)
        tag.append(f_tag)
        sent_id += 1
        tran_id += 1
        sid += 1

for tag in soup.find_all('p'):
    if not tag.find('p'):
        print tag.name,
        handle(tag)        
soup = bs4.BeautifulSoup(str(soup))


def handle_h(tag):
    global sent_id
    global tran_id
    global sid
    global sent_sql
    global tran_sql
    global finhtml
    str_tag = tag.contents[0]
    if len(tag.contents) < 2:
        a_tag = ''
    else:
        a_tag = tag.contents[1]
    orig_text = str_tag.string
    
    fsql.write(sent_sql.format(sent_id, sid, '%s/%s'%(folder, finhtml), str(orig_text), str(orig_text)))
    fsql.write(tran_sql.format(tran_id, sid, '%s/%s'%(folder, finhtml), str(orig_text)))
    tag.clear()
    f_tag = soup.new_tag('font')
    f_tag['id'] = '%s' % sid
    f_tag.string = '{{s.%s}}' % sid

    tag.append(f_tag)
    tag.append(a_tag)
    sent_id += 1
    tran_id += 1
    sid += 1
    
h_tags = ['h1', 'h2', 'h3', 'h4']
for ht in h_tags:
    for tag in soup.find_all(ht):
        if not tag.find(ht):
            print tag.name,
            handle_h(tag)
    soup = bs4.BeautifulSoup(str(soup))

def handle_a(tag):
    global sent_id
    global tran_id
    global sid
    global sent_sql
    global tran_sql
    global finhtml
    orig_text = tag.string
    
    fsql.write(sent_sql.format(sent_id, sid, '%s/%s'%(folder, finhtml), str(orig_text), str(orig_text)))
    fsql.write(tran_sql.format(tran_id, sid, '%s/%s'%(folder, finhtml), str(orig_text)))
    tag.clear()
    f_tag = soup.new_tag('font')
    f_tag['id'] = '%s' % sid
    f_tag.string = '{{s.%s}}' % sid

    tag.append(f_tag)
    sent_id += 1
    tran_id += 1
    sid += 1
    
for li_tag in soup.find_all('li'):
    if not li_tag.find('li'):
        a_tags = li_tag.find_all('a')
        for a_tag in a_tags:
            print a_tag.name,
            handle_a(a_tag)
    else:
        a_tag = li_tag.find_all('a')[0]
        print a_tag.name,
        handle_a(a_tag)
soup = bs4.BeautifulSoup(str(soup))

fhtml.write(str(soup))
fsql.close()
fhtml.close()

