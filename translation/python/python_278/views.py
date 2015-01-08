#-*- encoding: utf-8 -*-

from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response, HttpResponse
from django.utils.safestring import mark_safe
import json
import ngram
from bs4 import BeautifulSoup
from bs4.element import Tag

from models import *

_threshold = 0.6

def show(request, file_path):
    trans_texts = {}
    for t in Py276Sentence.objects.filter(file_path=file_path).values('sid', 'trans_text'):
        trans_texts[t['sid']] = mark_safe(t['trans_text'])
    return render_to_response('python_278/%s' % file_path, {'s': trans_texts})
    
def origion(request, file_path):
    origin_texts = Py276Sentence.objects.filter(file_path=file_path).values('sid', 'orig_text')
    dict_ots = dict((o['sid'], o['orig_text']) for o in origin_texts)
    return HttpResponse(json.dumps(dict_ots))
    
def translation(request, file_path, sid):
    if request.method == 'GET':
        translations = Py276Translation.objects.filter(file_path=file_path, sid=sid).values('id', 'trans_text', 'plus', 'minus')
        dict_trans = [{'tid': t['id'], 'trans_text': t['trans_text'], 'plus': t['plus'], 'minus': t['minus']} for t in translations]
        return HttpResponse(json.dumps(dict_trans))
    elif request.method == 'POST':
        translation = request.POST.get('translation', '')
        plus = int(request.POST.get('plus')) + 1
        minus = int(request.POST.get('minus'))
        pre_vote = int(request.POST.get('pre_vote'))
        snt = Py276Sentence.objects.get(file_path=file_path, sid=sid)
        score, factor = _compare_difference(snt.trans_text, translation)
        if  score < factor * 0.6:
            return HttpResponseBadRequest("译文与原文偏差太大。%s, %s" % (score, factor))
        if _compare_html_tags(snt.orig_text, translation) == False:
            return HttpResponseBadRequest("译文含有与原文不一致的标签。")
        t = Py276Translation(file_path=file_path, sid=sid, trans_text=translation, plus=plus, minus=minus)
        t.save()
        if (plus - minus > pre_vote):
            s = Py276Sentence.objects.filter(file_path=file_path, sid=sid)
            s.update(trans_text=translation)
        return HttpResponse(plus - minus - pre_vote)
    
def plus_vote(request, file_path, tid):
    t = Py276Translation.objects.get(id=tid, file_path=file_path)
    Py276Translation.objects.filter(id=tid, file_path=file_path).update(plus = t.plus + 1)
    return HttpResponse(t.plus + 1)        
    
def minus_vote(request, file_path, tid):
    t = Py276Translation.objects.get(id=tid, file_path=file_path)
    Py276Translation.objects.filter(id=tid, file_path=file_path).update(minus = t.minus + 1)
    return HttpResponse(t.minus + 1)
    
def _compare_difference(pre_transtion, cur_translation):
    pre_bs = BeautifulSoup(pre_transtion)
    cur_bs = BeautifulSoup(cur_translation)
    pre_txt = ''.join(pre_bs.strings)
    cur_txt = ''.join(cur_bs.strings)
    score = ngram.NGram.compare(pre_txt, cur_txt, N=2)
    factor = 0.2 + 0.02 * len(pre_txt) + 0.02 * len(cur_txt)
    if factor > 1.0:
        factor = 1.0
    return score, factor
    
def _compare_html_tags(original_text, translated_text):
    original_tags = []
    translation_tags = []
    for d in BeautifulSoup(original_text).descendants:
        if isinstance(d, Tag):
            original_tags.append(d)
    for d in BeautifulSoup(translated_text).descendants:
        if isinstance(d, Tag):
            translation_tags.append(d)
    if len(original_tags) != len(translation_tags):
        return False
    for d in BeautifulSoup(translated_text).descendants:
        if isinstance(d, Tag) and not _in_tags(d, original_tags):
           return False
    for d in BeautifulSoup(original_text).descendants:
        if isinstance(d, Tag) and not _in_tags(d, translation_tags):
           return False
    return True
    
def _in_tags(tag, original_tags):
    for o_tag in original_tags:
        if o_tag.name == tag.name and cmp(o_tag.attrs, tag.attrs) == 0:
            return True
    return False
