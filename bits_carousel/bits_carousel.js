import can from "can";
import initView from "./bits_carousel.stache!";
import BitModel from "models/bit";

import "./bits_carousel.less!";
import "can/map/define/";
import connectLiveService from "../connect-liveservice";

var MIN_CARD_WIDTH = 380;

var getNextClickTS = function(factor){
	return (new Date()).getTime() + (factor || 5000);
};

export default can.Component.extend({
	tag: 'bh-bits-carousel',
	template: initView,
	scope : {
		bitTag: 'bh-bit',
		hasNextPage: true,
		isLoading: false,
		fromLeft: 0,
		carouselWidth: 0,
		cardWidth: 220,
		nextClickTimeout : null,
		define : {
			params : {
				value : function(){
					return new can.Map();
				},
				get : function(lastSetValue){
					lastSetValue = lastSetValue || new can.Map();
					lastSetValue.attr('offset', lastSetValue.offset || this.attr('bits').length || 0);
					lastSetValue.attr('limit', 5);
					return lastSetValue;
				}
			},
		},
		getBitModel : function(){
			return this.bitModel || BitModel;
		},
		init : function(){
			var bitModel = this.getBitModel();
			this.attr('bits', new bitModel.List());
			this.loadNextPage();
		},
		loadNextPage : function(){
			var self = this;
			var bits = self.attr('bits');
			var hasContents = !!bits.length;
			var params;


			if(this.attr('hasNextPage')){
				this.attr('isLoading', true);

				params = this.attr('params').attr();
				//return;
				this.getBitModel().findAll(params).then(function(data){
					can.batch.start();

					if(data.length){
						if(data.length < self.attr('params.limit')){
							self.attr('hasNextPage', false);
						}
						
						self.attr('params.offset', self.attr('params.offset') + data.length);
						self.attr('isLoading', false);
						bits.push.apply(bits, data);
					} else {
						self.attr({
							isLoading: false,
							hasNextPage: false
						});
						bits.push.apply(bits, bits);
					}
					self.loadLatest();
					can.batch.stop();
					if(hasContents){
						self.carouselNext();
					}
				}, function(){
					self.attr({
						isLoading: false,
						hasNextPage: false
					});
				});
			} else {
				bits.push.apply(bits, bits.attr());
				this.carouselNext();
			}
		},
		loadLatest : function(){
			var self = this;
			clearTimeout(this.__loadTimeout);
			this.__loadTimeout = setTimeout(function(){
				self.getBitModel().findAll({offset: 0, limit: 5}).then(function(data){
					var current;
					var bits = self.attr('bits');
					bits.replace(data);
					self.loadLatest();
				});
			}, 30000);
		},
		loadingCardWidth : function(){
			return this.attr('cardWidth') - 5;
		},
		carouselContentWidth : function(){
			var cardWidth = this.attr('cardWidth');
			var width = this.attr('bits').attr('length') * cardWidth;
			if(this.attr('isLoading')){
				width = width + cardWidth;
			}
			return width;
		},
		carouselNext : function(ctx, el){
			var cardWidth = this.attr('cardWidth');
			var factor;
			if(el){
				el.trigger('interaction:carousel-scroll', [this.attr('state.hubId')]);
				factor = 10000;
			}
			this.nextClickTimeout = getNextClickTS(factor);
			if(this.attr('isLoading')){
				return;
			}

			var next = this.attr('fromLeft') + cardWidth;
			if(next > this.maxFromLeft()){
				this.loadNextPage();
			}
			this.attr('fromLeft', Math.min(next, this.maxFromLeft()));
		},
		maxFromLeft : function(){
			return this.carouselContentWidth() - this.attr('carouselWidth') - 10;
		},
		carouselPrev : function(ctx, el){
			var cardWidth = this.attr('cardWidth');
			var factor;
			if(el){
				factor = 10000;
			}
			this.nextClickTimeout = getNextClickTS(factor);
			this.attr('fromLeft', Math.max(0, this.attr('fromLeft') - cardWidth));
		}
	},
	helpers : {
		renderCard : function(bit, opts){
			var tag = this.attr('bitTag');
			var template = can.stache('<' + tag + ' bit="{bit}" state="{state}"></' + tag + '>');
			return template(opts.scope.add({bit: bit}));
		}
	},
	events : {
		init: function(){
			var self = this;
			this.measureWidth();
		},
		"{scope.bits} length" : function(){
				this.measureWidth();
		},
		'{window} resize': 'measureWidth',
		measureWidth: function(){
			var self = this;
			clearTimeout(this.__measureWidthTimeout);
			this.__measureWidthTimeout = setTimeout(function(){
				var outerWidth = self.element.find('.outer-carousel-wrap').width();
				var cardCount = Math.floor(outerWidth / MIN_CARD_WIDTH) || 1;
				var cardWidth = Math.max(MIN_CARD_WIDTH, (outerWidth + 10) / cardCount);
				self.scope.attr({
					carouselWidth: outerWidth,
					cardWidth: cardWidth,
					fromLeft: 0
				});
				setTimeout(function(){
					self.element.trigger('cardExpanded', [self.element.find('bh-bit-carousel').outerHeight()]);
				}, 100);
			}, 100);
		}
	}

});
